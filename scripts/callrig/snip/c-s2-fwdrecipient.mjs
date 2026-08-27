export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dst='C4QCGENERAL0001', src='C4QCPRIVATE0001';
  const out={};
  out.me=await page.evaluate(async()=>(await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).email);
  out.canSeeSource=await page.evaluate(async(src)=>{
    const r=await fetch(`/api/v1/messaging/channels/${src}/messages?limit=1`,{credentials:'include'});
    return {status:r.status};}, src);
  await page.goto('about:blank'); await page.waitForTimeout(500);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${dst}`);
  await page.waitForTimeout(8000);
  out.cards=await page.evaluate(()=>{
    const hits=[...document.querySelectorAll('main [data-message-id]')]
      .filter(e=>/no message text/.test(e.innerText||''));
    return hits.map(e=>({id:e.getAttribute('data-message-id'),
      txt:(e.innerText||'').replace(/\s+/g,' ').slice(0,80),
      imgs:e.querySelectorAll('img').length,
      btns:[...e.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().height>4)
        .map(b=>b.getAttribute('aria-label')).filter(Boolean).slice(0,8)}));});
  // try Open source message
  if(out.cards.length){
    const el=page.locator(`[data-message-id="${out.cards[0].id}"]`).first();
    await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(700);
    const osm=el.locator('button[aria-label="Open source message"]');
    out.osmCount=await osm.count();
    if(out.osmCount){
      await osm.first().click({force:true});
      await page.waitForTimeout(5000);
      out.afterOpen={url:page.url().slice(-60),
        main:await page.evaluate(()=>(document.querySelector('main')||{innerText:''}).innerText.replace(/\s+/g,' ').slice(0,140)),
        notices:await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')]
          .filter(e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;})
          .map(e=>e.textContent.trim().slice(0,60)))};
    }
  }
  return out;
};
