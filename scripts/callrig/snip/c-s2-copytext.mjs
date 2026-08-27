export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  try { await ctx.grantPermissions(['clipboard-read','clipboard-write'],
    {origin:'https://airion-cargo.store'}); } catch(e){}
  const seed=await page.evaluate(async (ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:ch,body:'QA-COPYTEXT probe'})});
    const j=await r.json(); return j.id||j.message?.id;}, ch);
  await page.waitForTimeout(2500);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={};
  out.displayedAuthor=await page.evaluate((id)=>{
    const e=document.querySelector(`[data-message-id="${id}"]`);
    return e?(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,46):'gone';}, seed);
  const msg=page.locator(`[data-message-id="${seed}"]`).first();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await msg.hover(); await page.waitForTimeout(1500);
  await page.evaluate(()=>navigator.clipboard.writeText('SENTINEL')).catch(()=>{});
  await page.evaluate(()=>{window.__c=[];document.addEventListener('click',e=>{
    const t=e.target.closest('button')||e.target;
    window.__c.push(((t.getAttribute&&t.getAttribute('aria-label'))||'').slice(0,20));},true);});
  await msg.locator('button[aria-label="Copy text"]').first().click({timeout:6000}).catch(e=>{out.err='FAIL';});
  await page.waitForTimeout(3500);
  out.landed=await page.evaluate(()=>window.__c);
  out.clipboard=await page.evaluate(async ()=>{
    try { return (await navigator.clipboard.readText()).slice(0,120); }
    catch(e){ return 'READ-FAILED'; }});
  out.myUsername=await page.evaluate(async ()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    const j=await r.json(); return {username:j.username, display:j.display_name||j.name};});
  return out;
};
