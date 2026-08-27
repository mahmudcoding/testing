export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4OX0TTLIMVOUBH`);
  await page.waitForTimeout(7000);
  return page.evaluate(async()=>{
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const r=await fetch('/api/v1/notifications?limit=500',{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const arr=j.notifications||j.items||(Array.isArray(j)?j:[]);
    const tn=arr.filter(n=>/thread reply/i.test(n.title||''));
    return {who:me.email||(me.user&&me.user.email), total:arr.length,
      threadReplyCount:tn.length,
      threadReplyNewest:tn.slice(0,2).map(n=>({title:n.title, body:(n.body||'').slice(0,30)})),
      anyV3TN:arr.filter(n=>/V3-TN|V3\\-TN/.test(JSON.stringify(n)))
        .map(n=>({type:n.type,title:n.title,body:(n.body||'').slice(0,30)}))};});
};
