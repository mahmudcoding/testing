// Lane D / sector N reset: close any modal, then any open side panel. Idempotent.
export default async ({page}) => {
  const out={steps:[]};
  for (let i=0;i<4;i++){
    const st = await page.evaluate(()=>({bd:document.querySelectorAll('.aloqa-modal-backdrop').length}));
    if(!st.bd) break;
    let done=false;
    for (const lbl of ['Close','Cancel']) {
      const b = page.locator('[role=dialog] button', {hasText:new RegExp('^'+lbl+'$')}).last();
      const b2 = page.locator(`[role=dialog] button[aria-label="${lbl}"]`).last();
      for (const loc of [b2,b]) {
        if (await loc.count()>0 && await loc.isVisible().catch(()=>false)){
          const box=await loc.boundingBox(); if(box){ await page.mouse.click(box.x+box.width/2, box.y+box.height/2); out.steps.push('click '+lbl); done=true; await page.waitForTimeout(1200); break; }
        }
      }
      if(done) break;
    }
    if(!done){ await page.keyboard.press('Escape'); out.steps.push('esc'); await page.waitForTimeout(1000); }
  }
  for (const t of ['call-controls-chat-toggle','call-controls-people-toggle','call-controls-settings-toggle','call-controls-breakout-rooms']) {
    const b = page.locator(`[data-testid="${t}"]`);
    if (await b.count()>0 && await b.first().getAttribute('aria-pressed')==='true'){
      const box = await b.first().boundingBox(); if(box){ await page.mouse.click(box.x+box.width/2, box.y+box.height/2); out.steps.push('closed '+t); await page.waitForTimeout(1000); }
    }
  }
  out.final = await page.evaluate(()=>({bd:document.querySelectorAll('.aloqa-modal-backdrop').length,
    panelOpen: !!document.querySelector('[data-testid="call-side-panel-slot"]'),
    url:location.pathname}));
  return out;
};
