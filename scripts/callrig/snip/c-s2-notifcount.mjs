// API-only, no navigation — safe for the parked tab
export default async ({page}) => page.evaluate(async ()=>{
  const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
  const r=await fetch('/api/v1/notifications?limit=500',{credentials:'include'});
  const j=await r.json().catch(()=>({}));
  const arr=j.notifications||j.items||(Array.isArray(j)?j:[]);
  const tag=(t)=>arr.filter(n=>new RegExp(t).test(JSON.stringify(n))).length;
  return {who:me.email||(me.user&&me.user.email), total:arr.length,
    threadReplies:arr.filter(n=>/thread reply/i.test(n.title||'')).length,
    aboutTag:tag('QA-NM')};
});
