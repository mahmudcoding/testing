export default async ({page}) => {
  const WS='W4QBF1XTURESO01', M='V4OWAZJ5MTHSO98';
  await page.goto(`https://airion-cargo.store/w/${WS}/calls/${M}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.evaluate(()=>{ const t=[...document.querySelectorAll('[role=tab]')].find(x=>/^Logs/.test(x.innerText.trim())); if(t) t.click(); });
  await page.waitForTimeout(2500);
  return await page.evaluate(()=>{
    const p=[...document.querySelectorAll('[role=tabpanel]')].filter(x=>x.getBoundingClientRect().width>0)[0]||document.body;
    const txt=p.innerText.replace(/\n{2,}/g,'\n');
    const lines=txt.split('\n').map(s=>s.trim()).filter(Boolean);
    const counts={};
    lines.forEach(l=>{ if(!/^\d{1,2}:\d{2}/.test(l)) counts[l]=(counts[l]||0)+1; });
    return { otherCount: (txt.match(/Other call activity/g)||[]).length,
             labels: Object.entries(counts).filter(([k,v])=>v>0 && k.length<40).slice(0,18) };
  });
};
