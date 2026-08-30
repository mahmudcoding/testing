export default async ({page}) => {
  const out={};
  const t = page.locator('[data-testid="call-controls-chat-toggle"]');
  out.found = await t.count();
  if (!out.found) return out;
  out.pressed0 = await t.first().getAttribute('aria-pressed');
  if (out.pressed0!=='true'){ await t.first().click(); await page.waitForTimeout(2500); }
  out.pressed1 = await t.first().getAttribute('aria-pressed');
  out.panel = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const p = document.querySelector('[data-testid="call-side-panel-slot"]');
    if(!p) return null;
    return {text:(p.innerText||'').replace(/\s+/g,' ').slice(0,800),
      btns:[...p.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,30),
      fields:[...p.querySelectorAll('input,textarea,[contenteditable]')].map(e=>({tag:e.tagName,type:e.type||null,ph:e.placeholder||null,al:e.getAttribute('aria-label'),ce:e.getAttribute('contenteditable')})),
      testids:[...p.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid).slice(0,25)};
  });
  return out;
};
