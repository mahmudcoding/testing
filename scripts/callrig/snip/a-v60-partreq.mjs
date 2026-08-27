const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{ const u=r.url(); if(!/\/api\/v1\//.test(u)) return;
    let b=null; try{ b=(await r.text()).slice(0,300); }catch(e){}
    net.push({m:r.request().method(), u:u.split('/api/v1/')[1].slice(0,72), s:r.status(), res:b}); });
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5200);
  net.length=0;                                   // only capture what opening the dialog triggers
  const chip = page.locator('[data-testid="calendar-event-chip"]', { hasText: 'Participant Check' }).first();
  await chip.scrollIntoViewIfNeeded(); await chip.click(); await page.waitForTimeout(3500);
  out.requestsOnOpen = net.filter(n=>/meeting|participant|attend|event/i.test(n.u));
  out.errors = net.filter(n=>n.s>=400);
  out.dialogText = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0];
    return (d?.innerText||'').replace(/\s+/g,' ').slice(0,220);},VS);
  return out;
};
