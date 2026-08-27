export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const TAG=process.env.QA_TAG||'QA-S2-DELCASE-1';
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(11000);
  return page.evaluate(async({ch,TAG})=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const hit=els.find(e=>(e.innerText||'').includes(TAG));
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=20`,{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const arr=j.messages||[];
    const m=arr.find(x=>(x.body||'').includes(TAG));
    return {visibleInFeed: !!hit,
      feedText: hit? (hit.innerText||'').replace(/\s+/g,' ').slice(-42):null,
      inApi: !!m, apiBody: m? (m.body||'').slice(0,24):null,
      newest3: arr.slice(0,3).map(x=>`${x.channel_seq}:${(x.body||'(empty)').slice(0,20)}`)};
  },{ch,TAG});
};
