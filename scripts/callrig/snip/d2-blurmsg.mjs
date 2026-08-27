const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const out={};
  for (const [key, path, idx, val] of [
        ['displayName','profile',0,'N'.repeat(45)],
        ['phone','account',0,'1'.repeat(18)]]) {
    await page.goto(`https://airion-cargo.store/w/${W}/settings/${path}`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2500);
    // type it the way a person does, then blur, then poll for a message
    const sel = `(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      return [...main.querySelectorAll('input[type=text],input:not([type])')].filter(vis)
        .filter(e=>e.getBoundingClientRect().left>300)[${idx}]; })`;
    await page.evaluate(`(() => { const i=${sel}(); i.focus(); })()`);
    await page.keyboard.press('Control+A').catch(()=>{});
    await page.keyboard.press('Meta+A').catch(()=>{});
    await page.keyboard.type(val.slice(0,45), { delay: 4 });
    await page.waitForTimeout(900);
    const beforeBlur = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'').replace(/\\s+/g,' ');
      const s=[...document.querySelectorAll('button')].filter(vis).filter(b=>/^Save/.test((b.innerText||'').trim()))[0];
      return { len:${sel}().value.length, saveDisabled:s?(s.disabled===true||s.getAttribute('aria-disabled')==='true'):null,
               hasMsg:/characters or fewer|7 to 15 digits|не больше 40|7–15/i.test(t) }; })()`);
    await page.evaluate(`(() => { ${sel}().blur(); })()`);
    await page.waitForTimeout(1600);
    const afterBlur = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const t=(main.innerText||'').replace(/\\s+/g,' ');
      const s=[...document.querySelectorAll('button')].filter(vis).filter(b=>/^Save/.test((b.innerText||'').trim()))[0];
      return { saveDisabled:s?(s.disabled===true||s.getAttribute('aria-disabled')==='true'):null,
               hasMsg:/characters or fewer|7 to 15 digits/i.test(t),
               anyRedText:[...main.querySelectorAll('p,span,div')].filter(vis)
                 .filter(e=>!e.children.length)
                 .map(e=>(e.innerText||'').trim()).filter(x=>x&&x.length<90)
                 .filter(x=>/enter|valid|fewer|digit|character/i.test(x)).slice(0,4) }; })()`);
    out[key]={ typedLen:beforeBlur.len, beforeBlur, afterBlur };
  }
  return out;
};
