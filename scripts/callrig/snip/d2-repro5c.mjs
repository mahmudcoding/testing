export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/privacy`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const ui = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main=document.querySelector('main');
    const combos=[...main.querySelectorAll('[role=combobox]')].filter(vis).map(c=>(c.innerText||'').trim());
    const sw=[...main.querySelectorAll('[role=switch]')].filter(vis).map(s=>{
      let lab=s.getAttribute('aria-label')||'', n=s, g=0;
      while(!lab && n && g++<8){ const p=n.previousElementSibling; if(p){const t=(p.innerText||'').trim(); if(t){lab=t;break;}} n=n.parentElement; }
      return {label:lab.replace(/\s+/g,' ').slice(0,40), on:s.getAttribute('aria-checked')};
    });
    return { comboValues:combos, switches:sw };
  });
  return ui;
};
