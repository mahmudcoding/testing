export default async ({page, ctx}) => {
  const mid=process.env.QA_MID;
  try { await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:'https://airion-cargo.store'}); } catch(e){}
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const src = await page.evaluate(async(mid)=>{
    const j=await (await fetch('/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=30',{credentials:'include'})).json();
    const m=(j?.data?.messages||j?.messages||[]).find(x=>x.id===mid);
    const a=document.querySelector(`[data-message-id="${mid}"]`);
    return {body:(m?.body||''), rendered:a?(a.innerText||'').replace(/\s+/g,' ').slice(0,90):null};
  }, mid);
  const art=await page.$(`[data-message-id="${mid}"]`);
  if(!art) return {err:'msg not visible', src};
  await art.hover().catch(()=>{}); await page.waitForTimeout(1600);
  const clicked = await page.evaluate((m)=>{const a=document.querySelector(`[data-message-id="${m}"]`);
    const b=[...a.querySelectorAll('button')].find(x=>/^copy text$/i.test((x.getAttribute('aria-label')||'').trim()));
    if(!b) return null; b.click(); return 'Copy text';}, mid);
  await page.waitForTimeout(2000);
  const clip = await page.evaluate(async()=>{
    try { return {ok:true, text:(await navigator.clipboard.readText()).slice(0,120)}; }
    catch(e){ return {ok:false, err:String(e).slice(0,80)}; }
  });
  return {mid, src, clicked, clip, hasBackslash: clip.ok ? /\\/.test(clip.text) : null};
};
