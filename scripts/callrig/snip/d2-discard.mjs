const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const net=[];
  page.on('response', async r => { if(r.request().method()==='GET') return;
    const u=r.url().replace(/^https?:\/\/[^/]+/,''); if(!/\/api\/v1\//.test(u)) return;
    let b=''; try{b=(await r.text()).slice(0,140);}catch{}
    net.push(`${r.request().method()} ${u.slice(0,40)} <- ${(r.request().postData()||'').slice(0,70)} -> ${r.status()} ${b}`); });
  const load=async()=>{ await page.goto(`https://airion-cargo.store/w/${W}/settings/profile`,{waitUntil:'networkidle'}); await page.waitForTimeout(2600); };
  const serverStatus=()=>page.evaluate(async()=>{ const r=await fetch('/api/v1/users/me/status',{credentials:'include'});
    return {s:r.status,b:(await r.text()).slice(0,140)}; });
  // 0. baseline: clear the status
  await load();
  await page.evaluate(async () => { await fetch('/api/v1/users/me/status',{method:'PUT',credentials:'include',
    headers:{'Content-Type':'application/json'},body:JSON.stringify({text:'',emoji:'',expires_at:null})}); });
  await load();
  const base = await serverStatus();
  const baseUI = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    return { radiosOn:[...main.querySelectorAll('[role=radio]')].filter(vis).filter(r=>r.getAttribute('aria-checked')==='true').length }; })()`);
  net.length=0;
  // 1. pick a preset
  const picked = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const r=[...main.querySelectorAll('[role=radio]')].filter(vis).filter(x=>/Sick/i.test(x.innerText||''));
    if(r.length!==1) return {n:r.length}; r[0].click(); return {n:1}; })()`);
  await page.waitForTimeout(1600);
  const afterPick = { net:[...net], server: await serverStatus() };
  // 2. press Discard
  const discard = await page.evaluate(`(() => { const vis=(${VIS});
    const b=[...document.querySelectorAll('button')].filter(vis).filter(x=>/^Discard$/.test((x.innerText||'').trim()));
    if(b.length!==1) return {n:b.length}; b[0].click(); return {n:1}; })()`);
  await page.waitForTimeout(2600);
  const afterDiscardImmediate = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    return { radiosOn:[...main.querySelectorAll('[role=radio]')].filter(vis).filter(r=>r.getAttribute('aria-checked')==='true')
              .map(r=>(r.innerText||'').replace(/\\s+/g,' ').trim()),
             bar:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim()).filter(t=>/^(Save|Discard)/.test(t)),
             fields:[...main.querySelectorAll('input')].filter(vis).map(e=>e.value).filter(Boolean).slice(0,4) }; })()`);
  const serverAfterDiscard = await serverStatus();
  await load();
  const afterReload = await page.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    return { radiosOn:[...main.querySelectorAll('[role=radio]')].filter(vis).filter(r=>r.getAttribute('aria-checked')==='true')
              .map(r=>(r.innerText||'').replace(/\\s+/g,' ').trim()),
             fields:[...main.querySelectorAll('input')].filter(vis).map(e=>e.value).filter(Boolean).slice(0,4) }; })()`);
  return { baseline:{server:base, radiosOn:baseUI.radiosOn}, picked, afterPick,
           discardClicked:discard, afterDiscardImmediate, serverAfterDiscard, afterReload,
           allNet:net.slice(0,8) };
};
