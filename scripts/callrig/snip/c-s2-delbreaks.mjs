export default async ({page, ctx}) => {
  try { return await run({page,ctx}); }
  finally { await ctx.setOffline(false); try{ await page.unroute('**/messaging/**'); }catch(e){} }
};
const run = async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  const mk=(txt)=>page.evaluate(async({ch,txt})=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:txt, idempotency_key:'qdb-'+Math.random().toString(36).slice(2)})});
    const j=await r.json(); return j.id;},{ch,txt});
  const snap=(id)=>page.evaluate((id)=>{
    const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      return o>0.05;};
    const el=document.querySelector(`main [data-message-id="${id}"]`);
    const toasts=[...new Set([...document.querySelectorAll('[data-sonner-toast],[role="alert"]')].filter(v)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,58)))];
    const notes=[...new Set([...document.querySelectorAll('*')].filter(e=>e.children.length===0&&v(e))
      .map(e=>(e.textContent||'').trim())
      .filter(t=>/Waiting for network|Could not|Try again|failed|Network error|deleted/i.test(t)))].slice(0,4);
    return {stillInFeed: !!el, toasts, notes};}, id);
  const doDelete=async(id)=>{
    const el=page.locator(`main [data-message-id="${id}"]`);
    await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(900);
    const more=el.locator('button[aria-label="More actions"]').first();
    if(!await more.count()) return {err:'no More actions'};
    await more.click(); await page.waitForTimeout(1300);
    const del=page.getByText(/^Delete$/).first();
    if(!await del.count()){ await page.keyboard.press('Escape'); return {err:'no Delete item'}; }
    await del.click(); await page.waitForTimeout(1500);
    // confirm dialog
    const conf=page.locator('button').filter({hasText:/^Delete$/}).last();
    if(await conf.count()) await conf.click();
    const series=[];
    for(let i=0;i<12;i++){ await page.waitForTimeout(700); series.push(await snap(id)); }
    return {toasts:[...new Set(series.flatMap(s=>s.toasts))],
      notes:[...new Set(series.flatMap(s=>s.notes))],
      leftFeed: series.some(s=>!s.stillInFeed), stillAtEnd: series[series.length-1].stillInFeed};
  };
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const A=await mk('QA-S2-DELBRK-A'); const B=await mk('QA-S2-DELBRK-B');
  await page.reload(); await page.waitForTimeout(9000);
  // A: genuine offline
  await ctx.setOffline(true); await page.waitForTimeout(1200);
  out.A_setOffline=await doDelete(A);
  await ctx.setOffline(false); await page.waitForTimeout(12000);
  out.A_serverAfter=await page.evaluate(async({ch,id})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=20`,{credentials:'include'});
    const j=await r.json(); return {present:(j.messages||[]).some(m=>m.id===id)};},{ch,id:A});
  // B: request fails, browser thinks it is online
  await page.reload(); await page.waitForTimeout(9000);
  await page.route('**/messaging/**', r=> r.request().method()==='DELETE' ? r.abort('failed') : r.continue());
  out.B_routeAbort=await doDelete(B);
  await page.unroute('**/messaging/**');
  out.B_serverAfter=await page.evaluate(async({ch,id})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=20`,{credentials:'include'});
    const j=await r.json(); return {present:(j.messages||[]).some(m=>m.id===id)};},{ch,id:B});
  return out;
};
