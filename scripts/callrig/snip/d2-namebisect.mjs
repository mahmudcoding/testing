const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const probe = async n => page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const i=[...main.querySelectorAll('input')].filter(vis)[0];
      const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      setter.call(i, 'N'.repeat(${n})); i.dispatchEvent(new Event('input',{bubbles:true}));
      i.dispatchEvent(new Event('change',{bubbles:true}));
      return null; })()`).then(async()=>{ await page.waitForTimeout(420);
      return page.evaluate(`(() => { const vis=(${VIS});
        const s=[...document.querySelectorAll('button')].filter(vis).filter(b=>/^Save/.test((b.innerText||'').trim()))[0];
        return s?(s.disabled===true||s.getAttribute('aria-disabled')==='true'):null; })()`); });
  const results={};
  for (const n of [1,2,3,48,56,60,61,62,63,64]) results[n]= await probe(n);
  // also: is any limit text anywhere on the page?
  const limitText = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    return { mentionsChars:/character|symbol|max|limit|\\d+ to \\d+/i.test(t),
             hint:[...main.querySelectorAll('p,span')].filter(vis).map(e=>(e.innerText||'').trim())
               .filter(x=>/character|max|limit/i.test(x)).slice(0,3),
             maxlenAttr:[...main.querySelectorAll('input')].filter(vis).map(e=>e.getAttribute('maxlength')) }; })()`);
  return { saveDisabledByLength:results, limitText };
};
