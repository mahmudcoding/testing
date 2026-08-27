// Verify pass: host admits everybody waiting.
const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const R = '[data-testid="call-overlay-expanded"]';
  const hasList = await page.evaluate((vs)=>{const vis=eval(vs);const l=document.querySelector('[data-testid="participants-list"]');return !!l&&vis(l);},VS);
  if(!hasList){
    await page.evaluate(()=>{const b=document.querySelector('[data-testid="call-controls-people-toggle"]'); if(b)b.click();});
    await page.waitForTimeout(2800);
  }
  // enumerate every visible button so we do not guess the label
  out.btns = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('button')].filter(vis)
      .map(b=>(b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,28))).filter(Boolean).slice(0,60);},VS);
  const aa = page.locator('button[aria-label^="Admit all"]').first();
  if(await aa.count()>0){ out.clicked='Admit all'; await aa.click(); await page.waitForTimeout(8000); }
  else {
    const n = await page.evaluate((vs)=>{const vis=eval(vs);
      const bs=[...document.querySelectorAll('button')].filter(vis).filter(b=>/^Admit$/.test((b.textContent||'').trim())||/^Admit /.test(b.getAttribute('aria-label')||''));
      bs.forEach(b=>b.click()); return bs.length;},VS);
    out.clicked='Admit x'+n; await page.waitForTimeout(8000);
  }
  out.roster = await page.evaluate((vs)=>{const vis=eval(vs);
    const l=document.querySelector('[data-testid="participants-list"]');
    return l?{ n:[...l.querySelectorAll('[data-testid="participant-row"]')].length,
      rows:[...l.querySelectorAll('[data-testid="participant-row"]')].map(r=>(r.innerText||'').replace(/\s+/g,' ').trim().slice(0,30))}:null;},VS);
  return out;
};
