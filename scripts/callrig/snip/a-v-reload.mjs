// Verify pass: hard-reload, rejoin if the call asks, then read the Side Rooms panel.
const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<2||r.height<2)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const j = page.locator('button',{hasText:/^Join$/}).first();
  out.sawJoinGate = await page.evaluate(()=>!!document.querySelector('[data-testid="call-overlay-expanded"]'))? false : true;
  if(out.sawJoinGate && await j.count()){ await j.click(); await page.waitForTimeout(8000); }
  await page.waitForTimeout(2000);
  await page.locator('button[aria-label="Side Rooms"]').first().click().catch(()=>{});
  await page.waitForTimeout(3000);
  out.panel = await page.evaluate((vs)=>{const vis=eval(vs);
    const anchor=document.querySelector('[data-testid="side-rooms-new"]');
    if(!anchor) return {err:'panel not open'};
    const p=anchor.closest('aside')||anchor.parentElement.parentElement;
    return (p.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean);},VS);
  return out;
};
