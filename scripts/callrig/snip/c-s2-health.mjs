export default async ({page}) => page.evaluate(async ()=>{
  const r=await fetch('/api/v1/auth/me',{credentials:'include'});
  const j=await r.json().catch(()=>({}));
  return {who:j.email||(j.user&&j.user.email)||null, status:r.status,
    url:location.pathname.slice(-24), openMin:+(performance.now()/60000).toFixed(1),
    heapMB: performance.memory? +(performance.memory.usedJSHeapSize/1048576).toFixed(1):null,
    visibility:document.visibilityState};
});
