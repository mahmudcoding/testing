const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const CARD = `(() => { const vis=(VISFN);
  const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
  if(!dlg) return null;
  const t=(dlg.innerText||'').replace(/\\s+/g,' ');
  return { text:t.slice(0,220),
           buttons:[...dlg.querySelectorAll('button')].filter(vis)
             .map(b=>({t:(b.innerText||'').trim().slice(0,18), dis:b.disabled===true||b.getAttribute('aria-disabled')==='true'})),
           hasUnblock:/Unblock/i.test(t),
           membershipLine:/cannot be blocked until/i.test(t) }; })()`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const card = CARD.replace('VISFN', VIS);
  const openCard = async () => {
    await page.goto(`https://airion-cargo.store/w/${W}/directories?tab=people`, { waitUntil:'networkidle' });
    await page.waitForTimeout(2800);
    await page.evaluate(`(() => { const vis=(${VIS});
      const main=document.querySelector('main')||document.body;
      const el=[...main.querySelectorAll('button,a[href],[role=button]')].filter(vis)
        .filter(b=>/QA Alice/.test(b.innerText||''))[0];
      if(el) el.click(); })()`);
    await page.waitForTimeout(2200);
    return page.evaluate(card);
  };
  const out={};
  out.before = await openCard();
  out.blockClick = await page.evaluate(`(() => { const vis=(${VIS});
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const b=dlg? [...dlg.querySelectorAll('button')].filter(vis).filter(x=>/^Block$/i.test((x.innerText||'').trim()))[0]:null;
    if(!b) return 'no Block'; if(b.disabled) return 'Block disabled'; b.click(); return 'clicked'; })()`);
  await page.waitForTimeout(3000);
  out.blockedApi = await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/messaging/users/blocked',{credentials:'include'});
    const t=await r.text(); return {s:r.status, blockedCount:(t.match(/user_id/g)||[]).length, body:t.slice(0,140)};})()`);
  out.after = await openCard();
  return out;
};
