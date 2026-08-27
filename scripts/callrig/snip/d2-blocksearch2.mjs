const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/privacy`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const type = async q => {
    await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const e=[...main.querySelectorAll('input')].filter(vis)
        .filter(x=>/participant|Search by name/i.test((x.getAttribute('placeholder')||'')))[0];
      e.focus(); const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      setter.call(e,''); e.dispatchEvent(new Event('input',{bubbles:true})); })()`);
    await page.waitForTimeout(350);
    await page.keyboard.type(q, { delay: 55 });
    await page.waitForTimeout(2000);
    return page.evaluate(`(() => { const vis=(${VIS});
      // everything that popped up: listbox, popper wrapper, cmdk
      const pops=[...document.querySelectorAll('[role=listbox],[data-radix-popper-content-wrapper],[cmdk-list],[role=dialog]')].filter(vis);
      return { popups:pops.length,
        popupText: pops.map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,120)),
        optionCount:[...document.querySelectorAll('[role=option],[cmdk-item]')].filter(vis).length,
        fieldValue:(()=>{const main=document.querySelector('main')||document.body;
          const e=[...main.querySelectorAll('input')].filter(vis).filter(x=>/Search by name/i.test(x.getAttribute('placeholder')||''))[0];
          return e?e.value:null;})() }; })()`);
  };
  const hit = await type('Car');
  const miss = await type('zzzzz');
  const cleared = await type('');
  return { withMatch:hit, noMatch:miss, cleared };
};
