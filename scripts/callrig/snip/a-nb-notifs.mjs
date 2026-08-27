export default async ({page}) => await page.evaluate(async ()=>{
  const r=await fetch('/api/v1/notifications?limit=6',{credentials:'include'});
  const j=await r.json(); const arr=j.notifications||j.data||j.items||[];
  return {status:r.status, n:(Array.isArray(arr)?arr:[]).slice(0,6).map(x=>({
    type:x.type, title:(x.title||'').slice(0,50), body:(x.body||x.message||'').slice(0,60),
    created:(x.created_at||'').slice(0,19)}))};
});
