// Guest joins, enters a Side Room, then LEAVES THE CALL cleanly (dialog confirmed),
// with a URL assertion that the leave actually happened.
export default async ({browser}) => {
  const link = process.env.QA_LINK; const name = process.env.QA_GUESTNAME || 'RoomLeave Guest';
  const room = process.env.QA_ROOM || 'Repro Room';
  const out={marks:[]}; const mark=s=>out.marks.push({t:new Date().toISOString().slice(11,19), s});
  const c = await browser.newContext(); const p = await c.newPage();
  await p.goto(link, {waitUntil:'domcontentloaded'}); await p.waitForTimeout(6000);
  const inp = p.locator('input').first();
  if (await inp.count()) { await inp.fill(name); await p.waitForTimeout(500); }
  const b = p.locator('button', {hasText:/Ask to join|Join/i}).first();
  if (await b.count()) await b.click();
  mark('asked');
  for (let i=0;i<30;i++){ await p.waitForTimeout(3000);
    const t = await p.evaluate(()=>(document.body.innerText||'').slice(0,60));
    if(!/Waiting for approval/.test(t)) { mark('admitted'); break; } }
  await p.waitForTimeout(8000);
  // join the side room
  const sr = p.locator('button[aria-label="Side Rooms"]').first();
  if (await sr.count()) { await sr.click(); await p.waitForTimeout(3000); }
  out.join = await p.evaluate((n)=>{ const vis=e=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const panel=document.querySelector('[data-testid="call-side-panel-slot"]')||document.body;
    const row=[...panel.querySelectorAll('*')].filter(vis).filter(e=>(e.innerText||'').includes(n))
      .filter(e=>[...e.querySelectorAll('button')].some(b=>/^(Join|Switch)$/.test((b.textContent||'').trim())))
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    if(!row) return {err:'no row', panel:(panel.innerText||'').replace(/\s+/g,' ').slice(0,150)};
    [...row.querySelectorAll('button')].filter(vis).find(b=>/^(Join|Switch)$/.test((b.textContent||'').trim())).click();
    return {ok:true}; }, room);
  await p.waitForTimeout(9000);
  mark('in room');
  out.inRoom = await p.evaluate(()=>({url:location.pathname.slice(0,50),
    txt:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,120)}));
  // clean leave with confirmation and URL assertion
  await p.mouse.move(700,500); await p.waitForTimeout(600);
  const lv = p.locator('button[aria-label="Leave call"]').first();
  out.leaveBtn = await lv.count();
  if (out.leaveBtn) { await lv.click(); await p.waitForTimeout(2500);
    out.dialog = await p.evaluate(()=>{ const vis=e=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const ds=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis)
        .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded');
      const d=ds.pop(); return d?(d.innerText||'').replace(/\s+/g,' ').slice(0,120):null; });
    const cf = p.locator('[data-testid="call-leave-confirm-submit"]').first();
    out.confirmBtn = await cf.count();
    if (out.confirmBtn) await cf.click();
    await p.waitForTimeout(8000); }
  mark('left');
  out.after = await p.evaluate(()=>({url:location.pathname.slice(0,60),
    stillInCall: /\/call\/|\/guest\/meeting\//.test(location.pathname),
    txt:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,120)}));
  await p.waitForTimeout(8000);
  return out;
};
