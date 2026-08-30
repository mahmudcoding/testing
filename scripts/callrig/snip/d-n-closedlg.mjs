export default async ({page}) => {
  const out={};
  const c = page.locator('[role=dialog] button[aria-label="Close"]').last();
  if (await c.count()>0 && await c.isVisible().catch(()=>false)){ const b=await c.boundingBox(); if(b){await page.mouse.click(b.x+b.width/2,b.y+b.height/2); out.closed=true; await page.waitForTimeout(1500);} }
  out.state = await page.evaluate(()=>({backdrops:document.querySelectorAll('.aloqa-modal-backdrop').length,
    composer:(()=>{const t=document.querySelector('[data-testid="in-call-chat-panel"] textarea'); return t?{ph:t.placeholder,dis:t.disabled}:null;})(),
    panelTail:(document.querySelector('[data-testid="in-call-chat-panel"]')?.innerText||'').replace(/\s+/g,' ').slice(-160)}));
  return out;
};
