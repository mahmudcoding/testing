export default async ({page}) => {
  const out={};
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.getAttribute('aria-pressed')!=='true'){ const b=await t.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(3000); }
  const ta = page.locator('[data-testid="call-side-panel-slot"] textarea, [data-testid="in-call-chat-panel"] textarea').first();
  out.taDis = await ta.isDisabled();
  if(out.taDis) return out;
  await ta.click(); await ta.fill(''); await ta.type(process.env.QA_TEXT||'guest msg',{delay:15});
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); await page.waitForTimeout(4000);
  out.rows = await page.evaluate(()=>[...document.querySelectorAll('[data-testid="ic-user-message"]')].map(r=>(r.innerText||'').replace(/\s+/g,' ').slice(0,70)));
  out.toasts = await page.evaluate(()=>[...document.querySelectorAll('[data-sonner-toast]')].map(t=>(t.innerText||'').replace(/\s+/g,' ').slice(0,120)));
  // guest live reaction
  const lr = page.locator('[data-testid="call-controls-live-reaction"]').first();
  out.liveReactionBtn = await lr.count();
  if(out.liveReactionBtn){
    const b=await lr.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(2500);
    out.reactionMenu = await page.evaluate(()=>{
      const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
        let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
      const cands=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=menu],[role=dialog]')].filter(vis).filter(m=>m.dataset.testid!=='call-overlay-expanded');
      const m=cands[cands.length-1]; if(!m) return null;
      const leaves=[...m.querySelectorAll('*')].filter(e=>e.children.length===0&&(e.innerText||'').trim()&&vis(e)).map(e=>{const r=e.getBoundingClientRect();return {t:e.innerText.trim().slice(0,4),x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};});
      return {n:leaves.length, leaves:leaves.slice(0,12)};});
    if(out.reactionMenu && out.reactionMenu.n){
      const p=out.reactionMenu.leaves[0]; out.sent=p.t;
      await page.mouse.click(p.x,p.y); await page.waitForTimeout(3000);
    }
  }
  return out;
};
