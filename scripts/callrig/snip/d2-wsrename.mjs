const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  const onResp = async r => { const m=r.request().method();
    if (m==='GET'||!/\/api\//.test(r.url())) return;
    let b=''; try{ b=(await r.text()).slice(0,160);}catch{}
    net.push(`${m} ${r.url().replace(/^https?:\/\/[^/]+/,'').slice(0,50)} -> ${r.status()} ${b}`); };
  page.on('response', onResp);
  await page.goto(`https://airion-cargo.store/w/${W}/settings/workspace`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const snap = `(() => { const vis=(${VIS});
    return [...document.querySelectorAll('body *')].filter(e=>!e.children.length).filter(vis)
      .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean); })()`;
  const nameBefore = await page.evaluate(`(() => { const vis=(${VIS});
    const i=[...document.querySelectorAll('input')].filter(vis).filter(x=>x.type!=='search')[0];
    return i? i.value : null; })()`);
  const base=new Set(await page.evaluate(snap));
  const typed = await page.evaluate(`(() => { const vis=(${VIS});
    const i=[...document.querySelectorAll('input')].filter(vis).filter(x=>x.type!=='search')[0];
    if(!i) return {ok:false};
    const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(i,'A'); i.dispatchEvent(new Event('input',{bubbles:true}));
    return {ok:true, value:i.value}; })()`);
  await page.waitForTimeout(900);
  // blur the field — this app names length limits on blur, not while typing
  await page.evaluate(`(() => { const vis=(${VIS});
    const i=[...document.querySelectorAll('input')].filter(vis).filter(x=>x.type!=='search')[0];
    if(i){ i.dispatchEvent(new Event('blur',{bubbles:true})); i.blur(); }
    const h=document.querySelector('h1'); if(h) h.click(); })()`);
  await page.waitForTimeout(1600);
  const afterBlur = await page.evaluate(snap);
  const blurTexts=[...new Set(afterBlur.filter(x=>!base.has(x)))].slice(0,8);
  const baseDirty=new Set(afterBlur);
  const btn = await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Save/i.test((x.innerText||'').trim()));
    return b.map(x=>({t:(x.innerText||'').trim().slice(0,20), disabled:x.disabled===true||x.getAttribute('aria-disabled')==='true'})); })()`);
  net.length=0;
  await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Save/i.test((x.innerText||'').trim()));
    if(b.length) b[0].click(); })()`);
  const seen=[]; const t0=Date.now();
  while (Date.now()-t0 < 9000) {
    for (const s of await page.evaluate(snap)) if(!base.has(s) && !baseDirty.has(s)) seen.push(s.slice(0,120));
    await page.waitForTimeout(250);
  }
  const nameAfter = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/users/me/workspaces',{credentials:'include'});
    const j=await r.json().catch(()=>null); const a=Array.isArray(j)?j:((j&&(j.workspaces||j.items))||[]);
    const w=a.find(x=>x.id==='${W}'); return w? w.name : null;})()`);
  page.off('response', onResp);
  return { nameBefore, typed, textsAfterBlur:blurTexts, saveButtons:btn, requests:[...net].slice(0,3),
           newTexts:[...new Set(seen)].slice(0,8), nameAfter, nameChanged: nameBefore!==nameAfter };
};
