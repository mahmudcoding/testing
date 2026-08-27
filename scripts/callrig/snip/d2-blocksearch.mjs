const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/privacy`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const field = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const i=[...main.querySelectorAll('input')].filter(vis)
      .filter(e=>/participant|block/i.test((e.getAttribute('placeholder')||'')+(e.getAttribute('aria-label')||'')));
    if(!i.length) return {found:0};
    const e=i[0]; e.focus();
    return { found:i.length, ph:e.getAttribute('placeholder')||'', role:e.getAttribute('role')||'' }; })()`);
  if (!field.found) return { err:'no participant search field', field };
  const out={field};
  for (const q of ['Car','zzzzz','QA']) {
    await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const e=[...main.querySelectorAll('input')].filter(vis)
        .filter(x=>/participant|block/i.test((x.getAttribute('placeholder')||'')+(x.getAttribute('aria-label')||'')))[0];
      const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      setter.call(e,''); e.dispatchEvent(new Event('input',{bubbles:true})); })()`);
    await page.waitForTimeout(400);
    await page.keyboard.type(q, { delay: 60 });
    await page.waitForTimeout(1800);
    out[q] = await page.evaluate(`(() => { const vis=(${VIS});
      const opts=[...document.querySelectorAll('[role=option],[role=listbox] li,[cmdk-item]')].filter(vis)
        .map(o=>(o.innerText||'').replace(/\\s+/g,' ').trim().slice(0,34));
      const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'').replace(/\\s+/g,' ');
      const blockBtn=[...main.querySelectorAll('button')].filter(vis).filter(b=>/^Block$/.test((b.innerText||'').trim()))[0];
      return { options:opts.slice(0,8), optionCount:opts.length,
               blockEnabled: blockBtn? !(blockBtn.disabled===true||blockBtn.getAttribute('aria-disabled')==='true') : null,
               noResults:/no (results|matches|participants)|ничего не найдено/i.test(t) }; })()`);
  }
  return out;
};
