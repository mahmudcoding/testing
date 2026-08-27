export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/privacy`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const out = {};
  out.labels = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('[role=combobox]')].filter(vis).map((c,i)=>{
      // nearest preceding heading-ish text
      let node=c, seen='';
      for (let up=0; up<6 && node; up++, node=node.parentElement) {
        const prev=[...(node.parentElement?.children||[])];
        const idx=prev.indexOf(node);
        for (let k=idx-1;k>=0 && k>=idx-3;k--){ const t=(prev[k].innerText||'').trim(); if(t && t.length<120){ seen=t; break; } }
        if (seen) break;
      }
      return { i, value:(c.innerText||'').trim().slice(0,24), heading: seen.replace(/\s+/g,' ').slice(0,90) };
    });
  });
  const cb = (await page.$$('[role=combobox]'))[0];
  if (cb) { await cb.click().catch(()=>{}); await page.waitForTimeout(1600); }
  out.options = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('[role=option],[role=menuitem],li[data-value]')].filter(vis).map(o=>(o.innerText||'').trim().replace(/\s+/g,' ').slice(0,36));
  });
  return out;
};
