// Guest joins the MAIN call only (no side room), then the context dies with the process.
export default async ({browser}) => {
  const link = process.env.QA_LINK; const name = process.env.QA_GUESTNAME || 'NoRoom Guest';
  const out={marks:[]}; const t0=Date.now(); const mark=s=>out.marks.push({t:new Date().toISOString().slice(11,19), s});
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
  await p.waitForTimeout(10000);
  out.inCall = await p.evaluate(()=>({path:location.pathname.slice(0,40),
    txt:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,130)}));
  // prove media is live before we kill it
  out.media = await p.evaluate(async ()=>{
    const pcs=window.__pcs||[]; const o=[];
    for (const pc of pcs) { if(pc.connectionState==='closed') continue;
      const st=await pc.getStats(); st.forEach(r=>{ if(r.type==='inbound-rtp'&&r.kind==='audio') o.push(r.packetsReceived||0); }); }
    return {pcs:pcs.length, inbound:o}; });
  await p.waitForTimeout(Number(process.env.QA_HOLD||30000));
  mark('about to vanish');
  return out;
};
