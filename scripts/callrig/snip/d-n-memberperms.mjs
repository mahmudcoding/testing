export default async ({page}) => {
  const s = page.locator('[data-testid="call-controls-settings-toggle"]').first();
  if (await s.getAttribute('aria-pressed')!=='true'){ const b=await s.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(2500); }
  return await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const sec=document.querySelector('[data-testid="meeting-settings-member-permissions"]');
    if(!sec) return null;
    return {full:(sec.innerText||'').replace(/\s+/g,' '),
      leaves:[...sec.querySelectorAll('*')].filter(e=>e.children.length===0&&(e.innerText||'').trim()&&vis(e)).map(e=>e.innerText.replace(/\s+/g,' ').trim()),
      chatState:sec.querySelector('[data-testid="meeting-settings-chat"]')?.getAttribute('aria-checked'),
      reactState:sec.querySelector('[data-testid="meeting-settings-reactions"]')?.getAttribute('aria-checked')};
  });
};
