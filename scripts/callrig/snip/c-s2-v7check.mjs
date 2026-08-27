export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  out.notifs = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/notifications?limit=8',{credentials:'include'})).json();
    return (j.notifications||j.data||j||[]).slice(0,5)
      .map(n=>({type:n.type, title:n.title, body:(n.body||'').slice(0,34)}));
  });
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/mentions`);
  await page.waitForTimeout(7000);
  out.mentionsPage = await page.evaluate(()=>{
    const m=document.querySelector('main');
    return (m?m.innerText:'').replace(/\s+/g,' ').slice(0,300);
  });
  out.hasV7 = {
    control: out.mentionsPage.includes('V7-CONTROL'),
    all: out.mentionsPage.includes('V7-ALL'),
    here: out.mentionsPage.includes('V7-HERE')};
  return out;
};
