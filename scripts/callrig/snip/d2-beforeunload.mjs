const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  let dialog=null;
  page.on('dialog', async d => { dialog={type:d.type(), msg:d.message().slice(0,120)}; await d.accept().catch(()=>{}); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2700);
  // make dirty by typing (real keystrokes)
  await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const i=[...main.querySelectorAll('input')].filter(vis).filter(e=>e.getBoundingClientRect().left>300)[0]; i.focus(); })()`);
  await page.keyboard.type('ZZ', { delay: 40 });
  await page.waitForTimeout(1200);
  const dirty = await page.evaluate(`(() => { const vis=(${VIS});
    const t=(document.querySelector('main')||document.body).innerText||'';
    return { unsaved:/unsaved/i.test(t),
      bar:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(x=>/^(Save|Discard)/.test(x)),
      hasBeforeUnload: (()=>{ let fired=false;
        const e=new Event('beforeunload',{cancelable:true}); fired=!window.dispatchEvent(e); return fired; })() }; })()`);
  // hard reload with dirty state
  await page.reload({ waitUntil:'networkidle' }).catch(()=>{});
  await page.waitForTimeout(2600);
  const afterReload = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const i=[...main.querySelectorAll('input')].filter(vis).filter(e=>e.getBoundingClientRect().left>300)[0];
    return { fieldValue:i.value,
      bar:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(x=>/^(Save|Discard)/.test(x)) }; })()`);
  const stored = await page.evaluate(async () => (await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).name);
  return { dirty, browserDialogSeen:dialog, afterReload, storedName:stored };
};
