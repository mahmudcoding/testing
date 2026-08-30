// Complete enumeration of visible interactive controls + any visible text mentioning react/chat.
export default async ({page}) => {
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.count() && await t.getAttribute('aria-pressed')!=='true'){ const b=await t.boundingBox(); if(b){await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(2500);} }
  return await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const surface=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const ctrls=[...surface.querySelectorAll('button,a[href],input,[role=switch],[role=radio],[tabindex]')].filter(vis)
      .map(e=>({l:(e.getAttribute('aria-label')||e.innerText||'').trim().replace(/\s+/g,' ').slice(0,34),
                tid:e.dataset.testid||null, dis:String(e.disabled)+'/'+e.getAttribute('aria-disabled')}));
    const reactText=[...new Set([...surface.querySelectorAll('*')].filter(e=>e.children.length===0&&e.innerText&&/react|emoji|disabled|off\b/i.test(e.innerText)&&vis(e))
      .map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,90)))];
    return {n:ctrls.length, ctrls, reactText,
      titles:[...new Set([...surface.querySelectorAll('[title]')].filter(vis).map(e=>e.getAttribute('title')))]};
  });
};
