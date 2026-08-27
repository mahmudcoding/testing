const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const STATE = `(() => { const vis=(VISFN);
  const main=document.querySelector('main')||document.body;
  const t=(main.innerText||'').replace(/\\s+/g,' ');
  const i=t.indexOf('Blocked');
  const region=i>=0? t.slice(i, i+300) : null;
  const ctl=[...main.querySelectorAll('button,input')].filter(vis)
    .filter(e=>{ let n=e; for(let k=0;k<7&&n;k++){ n=n.parentElement; if(!n)break;
      if(/Blocked/i.test((n.innerText||'').slice(0,400))) return true; } return false; })
    .map(e=>({ t:(e.innerText||'').trim().slice(0,20)||e.getAttribute('placeholder')||e.type, dis:e.disabled===true }));
  return { region, controlsNearBlocked:[...new Set(ctl.map(c=>c.t))].slice(0,8),
           mentionsAlice:/QA Alice|qa_d_alice/.test(t), emptyState:/no blocked|nobody|никого/i.test(t) }; })()`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const st = STATE.replace('VISFN', VIS);
  const go=async()=>{ await page.goto(`https://airion-cargo.store/w/${W}/settings/privacy`,{waitUntil:'networkidle'});
                      await page.waitForTimeout(2800); };
  const out={};
  await go(); out.before = await page.evaluate(st);
  out.block = await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/messaging/users/block',{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:'U4QDALICE000001'})});
    return {s:r.status, t:(await r.text()).slice(0,60)};})()`);
  await go(); out.whenBlocked = await page.evaluate(st);
  // try to unblock from this screen
  out.unblockClick = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const b=[...main.querySelectorAll('button')].filter(vis)
      .filter(x=>/^Unblock$/i.test((x.innerText||'').trim()))[0];
    if(!b) return 'no Unblock button'; if(b.disabled) return 'disabled'; b.click(); return 'clicked'; })()`);
  await page.waitForTimeout(2600);
  out.afterUnblockAttempt = await page.evaluate(st);
  out.blockedApiNow = await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/messaging/users/blocked',{credentials:'include'});
    const j=await r.json().catch(()=>null); return ((j&&j.users)||[]).map(u=>u.username);})()`);
  return out;
};
