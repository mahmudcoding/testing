export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  out.notifs=await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/notifications?limit=6',{credentials:'include'})).json();
    return (j.notifications||j.data||j||[]).slice(0,4)
      .map(n=>({type:n.type,title:n.title,body:(n.body||'').slice(0,40)}));});
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/mentions`);
  await page.waitForTimeout(7000);
  const txt=await page.evaluate(()=>{const m=document.querySelector('main');
    return (m?m.innerText:'').replace(/\s+/g,' ').slice(0,220);});
  out.mentionsHead=txt;
  out.hasEDMENT=txt.includes('EDMENT');
  return out;
};
