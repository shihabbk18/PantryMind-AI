// Free on-device inference. Remote requests download weights only, never photos.
const MODEL='onnx-community/swin-finetuned-food101-ONNX';
const REVISION='e5e50bfc6425aa546f3b4421ca8bd79d0dd610b8';
let classifier;
export async function recognizeFood(photo, onProgress=()=>{}) {
 onProgress('Preparing local food recognition… First use downloads approximately 93 MB of model weights. Your photo stays on this device.');
 try {
  if(!classifier){
   const {pipeline,env}=await import('./vendor/transformers.min.js');
   env.allowLocalModels=false;
   env.useBrowserCache=true;
   env.backends.onnx.wasm.numThreads=1;
   env.backends.onnx.wasm.proxy=false;
   env.backends.onnx.wasm.wasmPaths=new URL('./vendor/',import.meta.url).href;
   classifier=pipeline('image-classification',MODEL,{revision:REVISION,dtype:'q8',device:'wasm',progress_callback:event=>{
    if(event.status==='progress')onProgress(`Downloading food model: ${Math.round(event.progress||0)}% (${event.file}). Photo stays local.`);
    if(event.status==='ready')onProgress('Model ready. Reading the food photo locally…');
   }}).catch(error=>{classifier=null;throw error;});
  }
  const model=await classifier;
  onProgress('Reading the food photo locally…');
  return await model(photo,{top_k:3});
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
