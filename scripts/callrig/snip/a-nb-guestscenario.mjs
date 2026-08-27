export default async ({browser}) => {
  const link = process.env.QA_LINK;
  const name = process.env.QA_GUESTNAME || 'Night Guest';
  const room = process.env.QA_ROOM || 'Night Room 1';
  const out = {marks: []};
  const t0 = Date.now();
  const mark = (s) => out.marks.push({ms: Date.now()-t0, s});
  const c = await browser.newContext();
  const p = await c.newPage();
  await p.goto(link, {waitUntil:'domcontentloaded'});
  await p.waitForTimeout(6000);
  const inp = p.locator('input').first();
  if (await inp.count()) { await inp.fill(name); await p.waitForTimeout(500); }
  const b = p.locator('button', {hasText:/Ask to join|Join/i}).first();
  if (await b.count()) { await b.click(); }
  mark('asked to join');
  // wait for admission
  for (let i=0;i<40;i++) {
    await p.waitForTimeout(3000);
    const st = await p.evaluate(()=>({p:location.pathname, t:(document.body.innerText||'').slice(0,80)}));
    if (!/Waiting for approval/.test(st.t)) { mark('admitted: '+st.p.slice(0,40)); break; }
  }
  await p.waitForTimeout(6000);
  out.inCall = await p.evaluate(()=>({path:location.pathname.slice(0,60),
    txt:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,160)}));
  // open Side Rooms and join the room
  const sr = p.locator('button[aria-label="Side Rooms"]').first();
  out.hasSideRooms = await sr.count();
  if (out.hasSideRooms) { await sr.click(); await p.waitForTimeout(3000); }
  out.join = await p.evaluate((n)=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const panel=document.querySelector('[data-testid="call-side-panel-slot"]')||document.body;
    const row=[...panel.querySelectorAll('*')].filter(vis).filter(e=>(e.innerText||'').includes(n))
      .filter(e=>[...e.querySelectorAll('button')].some(b=>/^(Join|Switch)$/.test((b.textContent||'').trim())))
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    if(!row) return {err:'no row', panel:(panel.innerText||'').replace(/\s+/g,' ').slice(0,180)};
    const btn=[...row.querySelectorAll('button')].filter(vis).find(b=>/^(Join|Switch)$/.test((b.textContent||'').trim()));
    btn.click(); return {ok:true, at:Date.now()};
  }, room);
  mark('joined room click');
  await p.waitForTimeout(10000);
  out.final = await p.evaluate(()=>({txt:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,160)}));
  await p.waitForTimeout(Number(process.env.QA_HOLD||45000));   // hold the context open while the host panel is observed
  return out;
};
