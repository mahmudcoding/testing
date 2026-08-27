export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  const reqs=[];
  const h=res=>{const u=res.url(); if(u.includes('/api/v1/')&&!/GET/.test('')) reqs.push(res.request().method()+' '+res.status()+' '+u.split('/api/v1/')[1].split('?')[0].slice(0,50));};
  page.on('response',h);
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/privacy`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const before = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main')||document.body;
    const ctrls=[...main.querySelectorAll('[role=switch],input[type=checkbox],select,[role=combobox]')].filter(vis);
    const lab=e=>{const a=e.getAttribute('aria-label'); if(a) return a; let p=e.closest('label')||e.parentElement;
      for(let i=0;i<4&&p;i++,p=p.parentElement){const t=(p.innerText||'').trim(); if(t&&t.length<80) return t;} return '(none)';};
    return ctrls.map(c=>({ tag:c.tagName.toLowerCase(), role:c.getAttribute('role')||'', label:lab(c).replace(/\s+/g,' ').slice(0,52),
      state: c.getAttribute('aria-checked') ?? (c.checked!==undefined? String(c.checked): (c.value||'')) }));
  });
  return { controls: before, reqs: [...new Set(reqs)].slice(0,14) };
};
