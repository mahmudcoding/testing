const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const CB = `(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('[role=combobox]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300); })`;
  await page.goto(`https://airion-cargo.store/w/${W}/settings/calls`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2800);
  const out={};
  out.comboValues = await page.evaluate(`(() => ${CB}().map(e=>(e.innerText||'').trim().slice(0,30)))()`);
  // open the first (Microphone) and list options
  await page.evaluate(`(() => { const c=${CB}(); if(c[0]) c[0].click(); })()`);
  await page.waitForTimeout(1200);
  out.micOptions = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('[role=option]')].filter(vis).map(o=>({t:(o.innerText||'').trim().slice(0,34), sel:o.getAttribute('aria-selected')||''})); })()`);
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(600);
  // Test sound button — does it do anything observable?
  const beforeErr=[]; page.on('console', m=>{ if(m.type()==='error') beforeErr.push(m.text().slice(0,90)); });
  const testBtn = await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Test sound$/.test((x.innerText||'').trim()));
    if(b.length!==1) return {n:b.length}; b[0].click(); return {n:1}; })()`);
  await page.waitForTimeout(2500);
  out.testSound = { clicked:testBtn, consoleErrors:beforeErr.slice(0,3),
    stateAfter: await page.evaluate(`(() => { const vis=(${VIS});
      const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/Test sound|Stop|Playing/i.test((x.innerText||'').trim()));
      return b.map(e=>(e.innerText||'').trim().slice(0,24)); })()`) };
  // restore both switches to ON
  out.restore = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const l=[...main.querySelectorAll('[role=switch]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300);
    const before=l.map(e=>e.getAttribute('aria-checked'));
    l.forEach(e=>{ if(e.getAttribute('aria-checked')==='false') e.click(); });
    return { before }; })()`);
  await page.waitForTimeout(1500);
  await page.goto(`https://airion-cargo.store/w/${W}/settings/calls`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);
  out.afterRestore = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const l=[...main.querySelectorAll('[role=switch]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300);
    let st=null; try{st=JSON.parse(localStorage.getItem('aloqa-call-device-prefs')).state;}catch{}
    return { switches:l.map(e=>e.getAttribute('aria-checked')), nerd:localStorage.getItem('aloqa.calls.nerd-stats'), devicePrefs:st }; })()`);
  return out;
};
