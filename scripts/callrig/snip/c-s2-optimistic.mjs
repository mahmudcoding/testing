export default async ({page, ctx}) => {
  try { return await run({page,ctx}); }
  finally { try{ await page.unroute('**/api/**'); }catch(e){} await ctx.setOffline(false); }
};
const run = async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  const mk=(txt)=>page.evaluate(async({ch,txt})=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:txt, idempotency_key:'qop-'+Math.random().toString(36).slice(2)})});
    return (await r.json()).id;},{ch,txt});
  const look=(id)=>page.evaluate((id)=>{
    const e=document.querySelector(`main [data-message-id="${id}"]`);
    const v=(x)=>{const r=x.getBoundingClientRect();return r.width>3&&r.height>3;};
    return {reactionChips: e? [...e.querySelectorAll('button,[role="button"]')]
        .filter(b=>/^\p{Extended_Pictographic}/u.test((b.innerText||'').trim())).length : null,
      text: e? (e.innerText||'').replace(/\s+/g,' ').slice(-40):null,
      toasts:[...new Set([...document.querySelectorAll('[data-sonner-toast],[role="alert"]')].filter(v)
        .map(x=>(x.innerText||'').replace(/\s+/g,' ').slice(0,50)))]};},id);
  const srv=(id)=>page.evaluate(async({ch,id})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=20`,{credentials:'include'});
    const j=await r.json(); const m=(j.messages||[]).find(x=>x.id===id);
    return m? {reactions:(m.reactions||[]).length, pinned:!!m.pinned, body:(m.body||'').slice(0,22)}:'absent';},{ch,id});
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const R=await mk('QA-S2-OPT-react'), P=await mk('QA-S2-OPT-pin');
  await page.reload(); await page.waitForTimeout(9000);
  let blocked=0;
  await page.route('**/api/**', r=>{
    const u=r.request().url();
    if(/\/reactions$|\/pin$/.test(u) && r.request().method()==='POST'){ blocked++; return r.abort('failed'); }
    return r.continue();});
  // --- reaction
  const rEl=page.locator(`main [data-message-id="${R}"]`);
  await rEl.scrollIntoViewIfNeeded(); await rEl.hover(); await page.waitForTimeout(900);
  await rEl.locator('button[aria-label="Add reaction"]').first().click();
  await page.waitForTimeout(2800);
  const em=page.locator('[frimousse-emoji]:visible').first();
  if(await em.count()) await em.click();
  await page.waitForTimeout(6000);
  out.reaction={ui:await look(R), server:await srv(R)};
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  // --- pin
  const pEl=page.locator(`main [data-message-id="${P}"]`);
  await pEl.scrollIntoViewIfNeeded(); await pEl.hover(); await page.waitForTimeout(900);
  await pEl.locator('button[aria-label="More actions"]').first().click();
  await page.waitForTimeout(1400);
  const pin=page.getByText(/^Pin message$|^Pin$/).first();
  out.pinItemFound=await pin.count();
  if(out.pinItemFound){ await pin.click(); await page.waitForTimeout(6000); }
  else await page.keyboard.press('Escape');
  out.pin={ui:await look(P), server:await srv(P),
    bannerVisible: await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
        let o=1,n=e; while(n&&n!==document.documentElement){o*=parseFloat(getComputedStyle(n).opacity||'1'); n=n.parentElement;}
        return o>0.05;};
      return [...document.querySelectorAll('button[aria-label="Jump to pinned message"]')].filter(v).length;})};
  out.blockedRequests=blocked;
  return out;
};
