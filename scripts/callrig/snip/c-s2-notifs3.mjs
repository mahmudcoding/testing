export default async ({page}) => page.evaluate(async()=>{
  const r=await fetch('/api/v1/notifications?limit=500',{credentials:'include'});
  const j=await r.json().catch(()=>({}));
  const arr=j.notifications||j.items||(Array.isArray(j)?j:[]);
  const tn=arr.filter(n=>/thread reply/i.test(n.title||''));
  return {url:location.pathname.slice(-16), total:arr.length, threadReplies:tn.length,
    newest3:arr.slice(0,3).map(n=>({type:n.type,title:n.title,body:(n.body||'').slice(0,32)}))};});
