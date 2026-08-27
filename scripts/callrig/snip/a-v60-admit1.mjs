const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  const b = page.locator('button[aria-label^="Admit"]').first();
  out.found = await b.count()>0;
  if(out.found){ out.label=await b.getAttribute('aria-label'); await b.click(); await page.waitForTimeout(8000); }
  out.roster = await page.evaluate((vs)=>{const vis=eval(vs);
    const l=document.querySelector('[data-testid="participants-list"]');
    return l?{ header:(l.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,40),
      n:[...l.querySelectorAll('[data-testid="participant-row"]')].length}:null;},VS);
  return out;
};
