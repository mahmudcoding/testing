export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(10000);
  out.notifications=await page.evaluate(async()=>{
    const r=await fetch('/api/v1/notifications?limit=30',{credentials:'include'});
    const j=await r.json().catch(()=>({}));
    const arr=j.notifications||j.items||(Array.isArray(j)?j:[]);
    return arr.filter(n=>/QA-V3-|QA\\-V3\\-/.test(JSON.stringify(n)))
      .map(n=>({type:n.type, title:n.title, body:(n.body||'').slice(0,30)}));});
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/mentions`);
  await page.waitForTimeout(11000);
  out.mentionsPage=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const main=document.querySelector('main');
    const t=(main.innerText||'').replace(/\s+/g,' ');
    return {tabs:(t.match(/All \(\d+\)|Unread \(\d+\)/g)||[]),
      hasAll:/QA-V3-ALL/.test(t), hasHere:/QA-V3-HERE/.test(t), hasDirect:/QA-V3-DIRECT/.test(t),
      head:t.slice(0,70)};});
  out.PASS = out.notifications.length>=3
    && out.notifications.filter(n=>/mentioned/i.test(n.title||'')).length>=3
    && out.mentionsPage.hasDirect && !out.mentionsPage.hasAll && !out.mentionsPage.hasHere;
  return out;
};
