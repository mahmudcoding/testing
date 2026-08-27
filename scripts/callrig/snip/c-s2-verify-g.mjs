export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  // pick a message and open its thread
  const target=await page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const e=els[els.length-2];
    return e? e.getAttribute('data-message-id'):null;});
  const el=page.locator(`main [data-message-id="${target}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(900);
  await el.locator('button[aria-label="Reply"]').first().click();
  await page.waitForTimeout(4000);
  // ── #2: both hints exist; the thread one is invisible
  out.f2=await page.evaluate(()=>{
    const vis=(e)=>{const r=e.getBoundingClientRect(); if(r.width<3||r.height<3) return false;
      let o=1,n=e; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
        o*=parseFloat(cs.opacity||'1'); if(cs.display==='none'||cs.visibility==='hidden') return false; n=n.parentElement;}
      const hit=document.elementFromPoint(Math.round(r.left+r.width/2),Math.round(r.top+r.height/2));
      return o>0.05 && !!(hit&&(hit===e||e.contains(hit)));};
    const hints=[...document.querySelectorAll('*')].filter(e=>e.children.length===0)
      .filter(e=>/to send/i.test(e.textContent||''))
      .map(e=>{const r=e.getBoundingClientRect();
        return {text:(e.textContent||'').trim().slice(0,48), x:Math.round(r.left), y:Math.round(r.top),
          visible:vis(e), cls:(e.className||'').toString().slice(0,26),
          ariaHidden:e.getAttribute('aria-hidden')};});
    const md=[...document.querySelectorAll('button[aria-label="Markdown formatting"]')]
      .map(b=>({pressed:b.getAttribute('aria-pressed'), x:Math.round(b.getBoundingClientRect().left)}));
    return {hints, markdownButtons:md};});
  out.f2.PASS = out.f2.hints.length>=2 && out.f2.hints.some(h=>h.visible) && out.f2.hints.some(h=>!h.visible);
  // ── #10: Reply here quotes the stored (escaped) text
  const comps=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const n=await comps.count();
  out.threadComposerCount=n;
  if(n>1){
    const tc=comps.nth(n-1);
    for(let i=0;i<6;i++){ if((await tc.evaluate(e=>e.innerText.trim()))==='') break;
      await tc.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220); }
    await tc.click(); await tc.type('QA-V2-QMD **b** _i_ x-y',{delay:35}); await page.waitForTimeout(500);
    await page.keyboard.press('Meta+Enter'); await page.waitForTimeout(5000);
    const reply=await page.evaluate(()=>{
      const e=[...document.querySelectorAll('[data-message-id]')].reverse()
        .find(x=>/QA-V2-QMD/.test(x.innerText||''));
      return e? {id:e.getAttribute('data-message-id'), text:(e.innerText||'').replace(/\s+/g,' ').slice(-40)}:null;});
    out.f10={reply};
    if(reply){
      const rEl=page.locator(`[data-message-id="${reply.id}"]`).last();
      await rEl.hover(); await page.waitForTimeout(900);
      const rh=rEl.locator('button[aria-label="Reply here"]').first();
      out.f10.replyHereFound=await rh.count();
      if(out.f10.replyHereFound){
        await rh.click(); await page.waitForTimeout(2000);
        out.f10.composerQuote=await comps.nth(n-1).evaluate(e=>e.innerText.replace(/\s+/g,' ').slice(0,110));
        out.f10.PASS=/\\-|\\\*/.test(out.f10.composerQuote||'');
      }
    }
  }
  return out;
};
