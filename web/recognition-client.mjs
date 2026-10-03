let worker,sequence=0;
const pending=new Map();
function reset(message){worker?.terminate();worker=null;for(const request of pending.values()){clearTimeout(request.timer);request.reject(new Error(message));}pending.clear();}
export function recognizeFood(photo,onProgress=()=>{}) {
 if(!worker){
  worker=new Worker(new URL('./recognition-worker.mjs',import.meta.url),{type:'module'});
  worker.onmessage=({data})=>{
   const request=pending.get(data.id);if(!request)return;
   if(data.progress){request.onProgress(data.progress);return;}
   clearTimeout(request.timer);pending.delete(data.id);
   if(data.error)request.reject(new Error(data.error));else request.resolve(data.predictions);
  };
  worker.onerror=()=>reset('Local food recognition failed in this browser. Try again in a current desktop browser; manual nutrition entry still works.');
 }
 return new Promise((resolve,reject)=>{
  const id=++sequence,timer=setTimeout(()=>reset('Food recognition timed out. Check the connection for the first model download, then try again.'),300000);
  pending.set(id,{resolve,reject,onProgress,timer});worker.postMessage({id,photo});
 });
}
