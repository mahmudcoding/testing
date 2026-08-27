const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const PATH = process.env.D2_PATH || 'profile';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/${PATH}`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2700);
  const fields = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    return [...main.querySelectorAll('input[type=text],input:not([type])')].filter(vis)
      .filter(e=>e.getBoundingClientRect().left>300)
      .map((e,i)=>({i, maxlen:e.getAttribute('maxlength')||'(none)', ph:e.getAttribute('placeholder')||'',
        label:(()=>{let n=e,b='';for(let k=0;k<4&&n;k++){n=n.parentElement;if(!n)break;
          const t=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(t.length>3&&t.length<90){b=t;break;}}return b;})().slice(0,54),
        y:Math.round(e.getBoundingClientRect().top) })); })()`);
  const out=[];
  for (const f of fields) {
    for (const n of [200]) {
      await page.goto(`https://airion-cargo.store/w/${W}/settings/${PATH}`, { waitUntil:'networkidle' });
      await page.waitForTimeout(2200);
      const r = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
        const ins=[...main.querySelectorAll('input[type=text],input:not([type])')].filter(vis)
          .filter(e=>e.getBoundingClientRect().left>300);
        const i=ins[${f.i}]; if(!i) return {err:'gone'};
        const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
        setter.call(i, 'Z'.repeat(${n})); i.dispatchEvent(new Event('input',{bubbles:true}));
        i.dispatchEvent(new Event('change',{bubbles:true}));
        return { entered:i.value.length }; })()`);
      await page.waitForTimeout(1000);
      const st = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
        const s=[...document.querySelectorAll('button')].filter(vis).filter(b=>/^Save/.test((b.innerText||'').trim()))[0];
        const t=(main.innerText||'').replace(/\\s+/g,' ');
        return { saveDisabled: s?(s.disabled===true||s.getAttribute('aria-disabled')==='true'):null,
                 anyLimitMsg: /too long|characters|maximum|max /i.test(t),
                 msgs:[...main.querySelectorAll('p,span')].filter(vis).map(e=>(e.innerText||'').trim())
                   .filter(x=>/too long|character|maximum|limit/i.test(x)).slice(0,2) }; })()`);
      out.push({ field:f.label, maxlenAttr:f.maxlen, entered:r.entered, ...st });
    }
  }
  return { path:PATH, fields:fields.map(f=>({label:f.label,maxlen:f.maxlen})), results:out };
};
