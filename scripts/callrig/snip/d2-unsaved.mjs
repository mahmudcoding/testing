const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  let dialogSeen=null;
  page.on('dialog', async d => { dialogSeen={type:d.type(), msg:d.message().slice(0,120)}; await d.dismiss().catch(()=>{}); });
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2700);
  // make the form dirty: type into the display name
  const dirty = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const i=[...main.querySelectorAll('input')].filter(vis).filter(e=>e.getBoundingClientRect().left>300)[0];
    const was=i.value; i.focus();
    const setter=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    setter.call(i, was+' EDITED'); i.dispatchEvent(new Event('input',{bubbles:true}));
    i.dispatchEvent(new Event('change',{bubbles:true}));
    return { was, now:i.value }; })()`);
  await page.waitForTimeout(1200);
  const barBefore = await page.evaluate(`(() => { const vis=(${VIS});
    return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard)/.test(t)); })()`);
  // navigate away using the in-app nav link (client-side)
  const navigated = await page.evaluate(`(() => { const vis=(${VIS});
    const a=[...document.querySelectorAll('a[href*="/settings/appearance"]')].filter(vis)[0];
    if(!a) return {found:false}; a.click(); return {found:true}; })()`);
  await page.waitForTimeout(2800);
  const afterNav = await page.evaluate(`(() => { const vis=(${VIS});
    return { url:location.pathname,
      dialogs:[...document.querySelectorAll('[role=dialog]')].filter(vis).length,
      dialogText:(()=>{const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
        return d?(d.innerText||'').replace(/\\s+/g,' ').slice(0,160):'';})(),
      bar:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard)/.test(t)) }; })()`);
  // come back and see whether the edit survived
  await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const back = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const i=[...main.querySelectorAll('input')].filter(vis).filter(e=>e.getBoundingClientRect().left>300)[0];
    return { fieldValue:i.value,
      bar:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard)/.test(t)) }; })()`);
  const stored = await page.evaluate(async () => {
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json(); return me.name; });
  return { dirty, barBefore, navigated, browserDialog:dialogSeen, afterNav, back, storedName:stored };
};
