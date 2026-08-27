export default async ({page}) => {
  const WS='W4QBF1XTURESO01', M=process.env.QA_MEET;
  await page.goto(`https://airion-cargo.store/w/${WS}/calls/${M}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.evaluate(()=>{ const t=[...document.querySelectorAll('[role=tab]')].find(x=>/^Logs/.test(x.innerText.trim())); if(t) t.click(); });
  await page.waitForTimeout(2500);
  return await page.evaluate(()=>{
    const p=[...document.querySelectorAll('[role=tabpanel]')].filter(x=>x.getBoundingClientRect().width>0)[0]||document.body;
    const lines=p.innerText.split('\n').map(s=>s.trim()).filter(Boolean);
    // entries look like: <time> then <label> then optional "By X"
    const entries=[];
    for(let i=0;i<lines.length;i++){
      if(/^\d{1,2}:\d{2}:\d{2}\s?(AM|PM)$/.test(lines[i])){
        const label=lines[i+1]||'';
        const by=(lines[i+2]||'').startsWith('By ')? lines[i+2] : '';
        entries.push(`${lines[i]} | ${label}${by? ' | '+by : ''}`);
      }
    }
    return { total: entries.length, entries: entries.slice(0,30) };
  });
};
