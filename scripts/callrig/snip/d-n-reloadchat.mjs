export default async ({page}) => {
  const out={urlBefore:page.url()};
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.urlAfter = page.url();
  // rejoin if a lobby appeared
  for (const t of ['Join call','Join now','Join']) {
    const b = page.locator('button', {hasText:new RegExp('^'+t+'$')}).first();
    if (await b.count()>0 && await b.isVisible().catch(()=>false)){ const box=await b.boundingBox(); await page.mouse.click(box.x+box.width/2,box.y+box.height/2); out.clicked=t; await page.waitForTimeout(8000); break; }
  }
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  out.toggleFound = await t.count();
  if (out.toggleFound && await t.getAttribute('aria-pressed')!=='true'){ const b=await t.boundingBox(); if(b){await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(3500);} }
  out.state = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="in-call-chat-panel"]')||document.querySelector('[data-testid="call-side-panel-slot"]');
    if(!p) return {noPanel:true, body:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,200)};
    const ta=p.querySelector('textarea');
    const send=[...p.querySelectorAll('button')].find(b=>/^Send$/.test((b.innerText||'').trim())||b.getAttribute('aria-label')==='Send');
    return {ph:ta?ta.placeholder:null, taDis:ta?ta.disabled:null, sendDis:send?String(send.disabled):null,
      notice: ((p.innerText||'').match(/Chat is [^.\n]*/)||[null])[0],
      react:p.querySelectorAll('[data-testid="ic-message-react-trigger"]').length,
      threads:[...p.querySelectorAll('button')].filter(b=>/^Thread$/.test((b.innerText||'').trim())).length};
  });
  return out;
};
