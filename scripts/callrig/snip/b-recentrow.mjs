export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const vis = el => el.getBoundingClientRect().width>0 && el.getBoundingClientRect().height>0;
  out.rows = await page.evaluate(()=>{
    const v = el => el.getBoundingClientRect().width>0;
    const rows=[...document.querySelectorAll('*')].filter(el=>el.children.length &&
      /Outbound|Incoming/.test(el.innerText||'') && (el.innerText||'').length<170);
    const uniq=[]; const seen=new Set();
    rows.forEach(r=>{ const t=r.innerText.replace(/\s+/g,' ').trim(); if(!seen.has(t)){seen.add(t); uniq.push(r);} });
    return uniq.slice(0,3).map(r=>({
      text: r.innerText.replace(/\s+/g,' ').slice(0,110),
      buttons: [...r.querySelectorAll('button,a')].filter(v).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,8)
    }));
  });
  // hover the first row to reveal any hidden actions
  const first = await page.$('text=Outbound');
  if (first) { await first.hover().catch(()=>{}); await page.waitForTimeout(1500); }
  out.afterHover = await page.evaluate(()=>{
    const v = el => el.getBoundingClientRect().width>0;
    const rows=[...document.querySelectorAll('*')].filter(el=>el.children.length && /Outbound|Incoming/.test(el.innerText||'') && (el.innerText||'').length<170);
    if(!rows.length) return null;
    const r=rows[rows.length-1];
    return [...r.querySelectorAll('button,a')].filter(v).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,8);
  });
  return out;
};
