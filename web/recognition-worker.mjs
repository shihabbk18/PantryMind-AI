// Free on-device inference. Remote requests download weights only, never photos.
import {IMAGE_LABELS} from './food-vocabulary.mjs';
const MODEL='Xenova/clip-vit-base-patch32';
const REVISION='d15189d7028b43f1d3e65039190477f6af591c2a';
let classifier;
export async function recognizeFood(photo, onProgress=()=>{}) {
 onProgress('Preparing local CLIP recognition… First use downloads approximately 154 MB of model weights. Your photo stays on this device.');
 try {
  if(!classifier){
   const {pipeline,env}=await import('./vendor/transformers.min.js');
   env.allowLocalModels=false;
   env.useBrowserCache=true;
   env.backends.onnx.wasm.numThreads=1;
   env.backends.onnx.wasm.proxy=false;
   env.backends.onnx.wasm.wasmPaths=new URL('./vendor/',import.meta.url).href;
   classifier=pipeline('zero-shot-image-classification',MODEL,{revision:REVISION,dtype:'q8',device:'wasm',progress_callback:event=>{
    if(event.status==='progress')onProgress(`Downloading food model: ${Math.round(event.progress||0)}% (${event.file}). Photo stays local.`);
    if(event.status==='ready')onProgress('Model ready. Reading the food photo locally…');
   }}).catch(error=>{classifier=null;throw error;});
  }
  const model=await classifier;
  onProgress('Reading the food photo locally…');
  const output=await model(photo,IMAGE_LABELS.map(p=>p.description));
  return output.map(p=>({...IMAGE_LABELS.find(item=>item.description===p.label),score:p.score}));
 }catch(error){
  console.error('Local image recognition failed',error);
  throw new Error('Food recognition could not run. Connect for the first model download, then try Analyze photo again. If your browser runs out of memory, try a desktop browser. Manual nutrition entry still works.');
 }
}
// Serialize inference to bound memory; the main thread remains interactive.
let queue=Promise.resolve();
self.onmessage=({data})=>{queue=queue.then(async()=>{
 const started=performance.now();
 try{const predictions=await recognizeFood(data.photo,message=>self.postMessage({id:data.id,progress:message}));self.postMessage({id:data.id,predictions,elapsedMs:performance.now()-started});}
 catch(error){self.postMessage({id:data.id,error:error.message});}
});};
