export default async ({page}) => {
  const out={};
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const clear=async()=>{await comp.click();await page.keyboard.press('Control+A');await page.keyboard.press('Backspace');await page.waitForTimeout(300);
    return comp.evaluate(e=>e.innerText.trim());};
  const run=async(cmd, how)=>{
    const posts=[];
    const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST') posts.push(JSON.parse(r.postData()||'{}').body); };
    const c=await clear();
    await comp.type(cmd, {delay:70}); await page.waitForTimeout(1300);
    const optTxt=await page.evaluate(()=>[...document.querySelectorAll('[role="option"]')]
      .filter(e=>e.getBoundingClientRect().height>0).map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,34)));
    if (how==='click'){ const o=page.locator('[role="option"]').first(); if(await o.count()) await o.click(); }
    else { await page.keyboard.press('Enter'); }
    await page.waitForTimeout(1000);
    const after=await comp.evaluate(e=>e.innerText);
    const caret=await page.evaluate(()=>{ const s=getSelection();
      return s&&s.anchorNode? {offset:s.anchorOffset, node:(s.anchorNode.textContent||'').slice(0,24)}:null;});
    page.on('request', onReq);
    await page.keyboard.press('Enter'); await page.waitForTimeout(2600);
    page.off('request', onReq);
    const rendered=await page.evaluate(()=>{
      const els=[...document.querySelectorAll('main [data-message-id]')];
      const el=els[els.length-1];
      return el? (el.innerText||'').replace(/\s+/g,' ').slice(0,80):'none';});
    return {cmd, how, clearedTo:c, optTxt, composerAfterPick:after, caret, posted:posts, rendered};
  };
  out.shrugClick = await run('/shrug','click');
  out.shrugEnter = await run('/shrug','enter');
  out.me         = await run('/me','click');
  await clear();
  return out;
};
