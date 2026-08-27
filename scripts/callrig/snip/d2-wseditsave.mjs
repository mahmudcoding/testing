export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  const reqs=[];
  const h=res=>{const u=res.url(); if(u.includes('/api/v1/')&&res.request().method()!=='GET') reqs.push(res.request().method()+' '+res.status()+' '+u.split('/api/v1/')[1].split('?')[0].slice(0,46));};
  page.on('response',h);
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/workspace`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const inp = await page.$('main input[type="text"], main input:not([type])');
  const out = { found: !!inp };
  if (inp) {
    await inp.click({clickCount:3}).catch(()=>{});
    await page.keyboard.type('QA Workspace D Probe');
    await page.waitForTimeout(1200);
    out.afterType = await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const main=document.querySelector('main');
      return [...main.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean);
    });
    const save = await page.$('main button:has-text("Save")');
    out.saveButton = !!save;
    if (save) { await save.click().catch(()=>{}); await page.waitForTimeout(3000); }
  }
  page.off('response',h);
  out.writes = [...new Set(reqs)];
  out.final = await page.evaluate(()=>{
    const main=document.querySelector('main');
    const i=main.querySelector('input');
    const t=(main.innerText||'').replace(/\s+/g,' ');
    return { value: i? i.value:'(none)', toast: /saved|updated|success|error|failed|permission/i.test(t)? t.slice(0,160):'(no toast text)' };
  });
  return out;
};
