const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/\/api\/v1\//.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,140);}catch{}
    net.push(`${r.request().method()} ${u.slice(0,36)} <- ${(r.request().postData()||'').slice(0,60)} -> ${r.status()} ${b.replace(/\s+/g,' ')}`); });
  const out=[];
  for (const val of [process.env.D2_A, process.env.D2_B, process.env.D2_C].filter(Boolean)) {
    await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2500);
    await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const i=[...main.querySelectorAll('input')].filter(vis)[0];
      const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      setter.call(i, VAL); i.dispatchEvent(new Event('input',{bubbles:true})); i.dispatchEvent(new Event('change',{bubbles:true})); })()`
      .replace('VAL', JSON.stringify(val)));
    await page.waitForTimeout(1100);
    const pre = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const save=[...document.querySelectorAll('button')].filter(vis).filter(b=>/^Save/.test((b.innerText||'').trim()))[0];
      const i=[...main.querySelectorAll('input')].filter(vis)[0];
      let msgs=[]; let n=i;
      for(let k=0;k<4&&n;k++){ n=n.parentElement; if(!n)break;
        msgs=[...n.querySelectorAll('p,span')].filter(vis).map(e=>(e.innerText||'').trim())
          .filter(x=>x&&x.length<120&&x!==i.value); if(msgs.length) break; }
      return { valueLen:i.value.length,
               saveFound:!!save, saveDisabled: save?(save.disabled===true||save.getAttribute('aria-disabled')==='true'):null,
               nearMsgs:msgs.slice(0,3) }; })()`);
    net.length=0;
    await page.evaluate(`(() => { const vis=(${VIS});
      const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Save/.test((x.innerText||'').trim()));
      if(b.length) b[0].click(); })()`);
    await page.waitForTimeout(3000);
    const post = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
      const i=[...main.querySelectorAll('input')].filter(vis)[0];
      let msgs=[]; let n=i;
      for(let k=0;k<5&&n;k++){ n=n.parentElement; if(!n)break;
        msgs=[...n.querySelectorAll('p,span')].filter(vis).map(e=>(e.innerText||'').trim())
          .filter(x=>x&&x.length<130&&x!==i.value); if(msgs.length) break; }
      return { nearMsgs:msgs.slice(0,3),
        notices:[...document.querySelectorAll('[data-sonner-toast],[role=status],[role=alert],[class*=oast]')].filter(vis)
          .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean).slice(0,3),
        bar:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard)/.test(t)) }; })()`);
    const stored = await page.evaluate(async () => {
      const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
      return { name:me.name, len:(me.name||'').length }; });
    out.push({ len:val.length, pre, requests:[...net], post, stored });
  }
  return out;
};
