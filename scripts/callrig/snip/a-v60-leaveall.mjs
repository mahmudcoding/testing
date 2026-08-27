const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.keyboard.press('Escape').catch(()=>{});
  // switch to main tab if in a room
  const mainTab = await page.evaluate((vs)=>{const vis=eval(vs);
    const b=[...document.querySelectorAll('button,[role="tab"]')].filter(vis).find(b=>/Share Pass/.test(b.innerText||''));
    if(!b) return null; const r=b.getBoundingClientRect(); return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};},VS);
  if(mainTab){ await page.mouse.click(mainTab.x,mainTab.y); await page.waitForTimeout(3500); }
  out.toolbar = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,24)).filter(t=>/leave|end/i.test(t));},VS);
  for(const lbl of [/End for everyone/i,/^Leave call$/]){
    const b=page.locator('button').filter({hasText:lbl}).first();
    if(await b.count()){ await b.click().catch(()=>{}); out.clicked=String(lbl); await page.waitForTimeout(2500); break; }
  }
  const sub = page.locator('[data-testid="call-end-confirm-submit"]').first();
  if(await sub.count()){ await sub.click().catch(()=>{}); out.confirmed=true; }
  await page.waitForTimeout(7000);
  out.after = await page.evaluate(()=>({url:location.pathname.slice(0,44), msgs:document.querySelectorAll('[data-message-id]').length}));
  return out;
};
