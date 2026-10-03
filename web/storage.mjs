let connection;
export function openKitchen() {
  if(connection) return connection;
  connection=new Promise((resolve,reject)=>{
    if(!globalThis.indexedDB) return reject(new Error('Local storage is unavailable. Use a browser that supports IndexedDB.'));
    const request=indexedDB.open('pantrymind-kitchen',1);
    request.onupgradeneeded=()=>{
      for(const store of ['pantry','favorites','meals']) request.result.createObjectStore(store,{keyPath:'id'});
    };
    request.onerror=()=>reject(new Error('Your browser could not open local kitchen storage. Check its privacy settings.'));
    request.onblocked=()=>reject(new Error('Close other PantryMind tabs and reload to update local storage.'));
    request.onsuccess=()=>{
      const db=request.result; db.onversionchange=()=>db.close(); resolve(db);
    };
  });
  return connection;
}
export async function records(store) {
  const db=await openKitchen();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readonly'), request=tx.objectStore(store).getAll();
    let result; request.onsuccess=()=>{result=request.result;};
    tx.oncomplete=()=>resolve(result); tx.onerror=tx.onabort=()=>reject(new Error('Could not read your saved kitchen. Please reload.'));
  });
}
export async function write(store, value, remove=false, previousId=null) {
  const db=await openKitchen();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(store,'readwrite');
    if(previousId!=null && previousId!==value.id)tx.objectStore(store).delete(previousId);
    if(remove) tx.objectStore(store).delete(value); else tx.objectStore(store).put(value);
    tx.oncomplete=()=>resolve();
    tx.onerror=tx.onabort=()=>reject(new Error('Your browser could not save this change. Storage may be full or disabled.'));
  });
}
