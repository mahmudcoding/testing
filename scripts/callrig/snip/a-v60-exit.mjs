const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.keyboard.press('Escape').catch(()=>{});
  // 1) leave the side room if we are in one
  const lr = page.locator('button', { hasText: /^Leave room$/ }).first();
  if(await lr.count()){ await lr.click().catch(()=>{}); out.leftRoom=true; await page.waitForTimeout(6000); }
  // 2) switch to the main call tab (whatever it is called)
  const mt = await page.evaluate((vs)=>{const vis=eval(vs);
    const tabs=[...document.querySelectorAll('button,[role="tab"]')].filter(vis)
      .filter(b=>/\d+:\d\d/.test(b.innerText||'') && !/Room/i.test(b.innerText||''));
    if(!tabs.length) return null; const r=tabs[0].getBoundingClientRect();
    return {t:tabs[0].innerText.replace(/\s+/g,' ').trim().slice(0,24),x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};},VS);
  out.mainTab=mt;
  if(mt){ await page.mouse.click(mt.x,mt.y); await page.waitForTimeout(4000); }
  // 3) end for everyone (host) or leave
  for(const rx of [/End for everyone/i, /^Leave call$/]){
    const b=page.locator('button').filter({hasText:rx}).first();
    if(await b.count()){ await b.click().catch(()=>{}); out.clicked=String(rx); await page.waitForTimeout(2500); break; }
  }
  const s=page.locator('[data-testid="call-end-confirm-submit"]').first();
  if(await s.count()){ await s.click().catch(()=>{}); out.confirmed=true; }
  await page.waitForTimeout(8000);
  out.after = await page.evaluate(()=>({url:location.pathname}));
  return out;
};
