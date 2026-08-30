export default async ({page}) => {
  const out={};
  // close settings panel if open, open chat
  const s = page.locator('[data-testid="call-controls-settings-toggle"]').first();
  if (await s.count() && await s.getAttribute('aria-pressed')==='true'){ await s.click(); await page.waitForTimeout(1200); }
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.getAttribute('aria-pressed')!=='true'){ await t.click(); await page.waitForTimeout(2500); }
  out.rows = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    return [...document.querySelectorAll('[data-testid="ic-user-message"]')].map(r=>({
      txt:(r.innerText||'').replace(/\s+/g,' ').slice(0,160),
      btns:[...r.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()),
      tids:[...r.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid)}));
  });
  out.unread = await page.evaluate(()=>document.querySelector('[data-testid="call-controls-chat-unread-count"]')?.innerText||null);
  return out;
};
