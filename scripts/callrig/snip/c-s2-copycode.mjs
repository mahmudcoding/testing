export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  try { await ctx.grantPermissions(['clipboard-read','clipboard-write'],
    {origin:'https://airion-cargo.store'}); } catch(e){}
  const body='QA-COPYCODE\n```js\nconst x = 41 + 1;\nconsole.log(x);\n```';
  const seed=await page.evaluate(async ({ch,body})=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body})});
    const j=await r.json(); return j.id||j.message?.id;},{ch,body});
  await page.waitForTimeout(2000);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={seed:seed.slice(-5)};
  const msg=page.locator(`[data-message-id="${seed}"]`).first();
  await msg.scrollIntoViewIfNeeded().catch(()=>{});
  await msg.hover(); await page.waitForTimeout(1500);
  out.rendered=await msg.evaluate(e=>({
    hasPre:!!e.querySelector('pre'), hasCode:!!e.querySelector('code'),
    text:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,70)}));
  const btn=msg.locator('button[aria-label="Copy code"]').first();
  out.buttonCount=await btn.count();
  if(!out.buttonCount){
    out.allButtons=await msg.evaluate(e=>[...new Set([...e.querySelectorAll('button')]
      .map(b=>b.getAttribute('aria-label')||b.innerText||'(unnamed)'))].slice(0,12));
    return out;
  }
  await page.evaluate(()=>navigator.clipboard.writeText('SENTINEL-BEFORE')).catch(()=>{});
  await btn.click({timeout:6000}).catch(()=>{out.clickFail=true});
  await page.waitForTimeout(3000);
  out.clipboard=await page.evaluate(async ()=>{
    try { return (await navigator.clipboard.readText()).slice(0,80); }
    catch(e){ return 'READ-FAILED: '+String(e.message).slice(0,40); }});
  out.toasts=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
      .map(e=>(e.innerText||'').trim().slice(0,40)).filter(Boolean).slice(0,2);});
  return out;
};
