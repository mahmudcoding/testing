const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/account`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const r={};
  for (const n of [11,12,13,14,15,16,17,18,19]) {
    await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const ins=[...main.querySelectorAll('input[type=text],input:not([type])')].filter(vis)
        .filter(e=>e.getBoundingClientRect().left>300);
      const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      setter.call(ins[0], '1'.repeat(${n})); ins[0].dispatchEvent(new Event('input',{bubbles:true}));
      ins[0].dispatchEvent(new Event('change',{bubbles:true})); })()`);
    await page.waitForTimeout(430);
    r[n]= await page.evaluate(`(() => { const vis=(${VIS});
      const s=[...document.querySelectorAll('button')].filter(vis).filter(b=>/^Save/.test((b.innerText||'').trim()))[0];
      return s?(s.disabled===true||s.getAttribute('aria-disabled')==='true'):null; })()`);
  }
  return r;
};
