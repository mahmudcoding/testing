export default async ({page}) => page.evaluate(async ()=>{
  const r=await fetch('/api/v1/notifications?limit=30',{credentials:'include'});
  const j=await r.json(); const a=(j&&(j.notifications||j.items))||[];
  const list=Array.isArray(a)?a:[];
  const mine=list.filter(n=>JSON.stringify(n).includes('QA-THRNOTIF'));
  const me=await fetch('/api/v1/auth/me',{credentials:'include'});
  const mj=await me.json();
  return {who:mj.display_name||mj.name||mj.email,
    total:list.length,
    threadNotifs:mine.map(n=>({title:n.title, key:n.title_key, type:n.type,
      body:String(n.body||'').slice(0,30)}))};
});
