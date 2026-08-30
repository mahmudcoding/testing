export default async ({page}) => {
  const out={};
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  out.toggle = await t.count();
  if (out.toggle && await t.getAttribute('aria-pressed')!=='true'){ const b=await t.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(3000); }
  out.panel = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const p=document.querySelector('[data-testid="in-call-chat-panel"]')||document.querySelector('[data-testid="call-side-panel-slot"]');
    if(!p) return null;
    const ta=p.querySelector('textarea');
    return {full:(p.innerText||'').replace(/\s+/g,' ').slice(0,700),
      rows:[...p.querySelectorAll('[data-testid="ic-user-message"]')].length,
      btns:[...p.querySelectorAll('button')].filter(vis).map(b=>({l:(b.getAttribute('aria-label')||b.innerText||'').trim(),dis:b.disabled||b.getAttribute('aria-disabled')})),
      ta: ta?{ph:ta.placeholder,dis:ta.disabled}:null,
      testids:[...new Set([...p.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid))]};
  });
  return out;
};
