export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const readRows = ()=>page.evaluate(()=>{
    const t=document.body.innerText.replace(/\s+/g,' ');
    const seg=(t.match(/Recent calls.*/)||[''])[0];
    const rows=(seg.match(/(Outbound|Incoming) · [A-Za-z]+ · [^·]+· \d+m/g)||[]);
    return {count:rows.length, sample:rows.slice(0,8)};
  });
  const clickTab = async (label)=>{ await page.evaluate((l)=>{ const b=[...document.querySelectorAll('button')].find(x=>(x.innerText||'').replace(/\s+/g,' ').trim().startsWith(l)); if(b) b.click(); }, label); await page.waitForTimeout(2500); };
  out.all = await readRows();
  await clickTab('1-to-1'); out.oneToOne = await readRows();
  await clickTab('Group meetings'); out.group = await readRows();
  await clickTab('All'); out.backToAll = await readRows();
  return out;
};
