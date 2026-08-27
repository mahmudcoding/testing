const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(800);
  // switch to the MAIN call tab
  const mainTab = await page.evaluate((vs)=>{const vis=eval(vs);
    const b=[...document.querySelectorAll('button,[role="tab"]')].filter(vis).find(b=>/Guest Pass/.test(b.innerText||''));
    if(!b) return null; const r=b.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};},VS);
  out.mainTab=mainTab;
  if(mainTab){ await page.mouse.click(mainTab.x,mainTab.y); await page.waitForTimeout(4000); }
  out.toolbar = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,24)).filter(t=>/end|leave/i.test(t));},VS);
  const ef = page.locator('button',{hasText:/End for everyone/i}).first();
  out.endFound = await ef.count()>0;
  if(!out.endFound) return out;
  await ef.click(); await page.waitForTimeout(2500);
  const sub = page.locator('[data-testid="call-end-confirm-submit"]').first();
  out.confirmFound = await sub.count()>0;
  if(out.confirmFound){ await sub.click(); await page.waitForTimeout(8000); }
  out.after = await page.evaluate(()=>({url:location.pathname.slice(0,44)}));
  return out;
};
