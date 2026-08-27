export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(8000);
  return page.evaluate(async()=>{
    const r=await fetch('/api/v1/notifications?limit=500',{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const arr=j.notifications||j.items||(Array.isArray(j)?j:[]);
    return {url:location.pathname.slice(-16), total:arr.length,
      threadReplies:arr.filter(n=>/thread reply/i.test(n.title||'')).length};});
};
