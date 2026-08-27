const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{ const u=r.url(); if(!/\/api\/v1\//.test(u)) return;
    let b=null; try{ b=(await r.text()).slice(0,180); }catch(e){}
    net.push({m:r.request().method(), u:u.split('/api/v1/')[1].slice(0,70), s:r.status(), res:b}); });
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5200);
  net.length=0;
  const chip = page.locator('[data-testid="calendar-event-chip"]', { hasText: 'Participant Check' }).first();
  await chip.scrollIntoViewIfNeeded(); await chip.click(); await page.waitForTimeout(4000);
  out.who = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>null); return j?.email??j?.data?.email;});
  out.allRequestsOnOpen = net.map(n=>`${n.m} ${n.u} -> ${n.s}`);
  out.bodiesOfInterest = net.filter(n=>/participant|attend|respond|meeting/i.test(n.u)).map(n=>({u:n.u,s:n.s,res:n.res}));
  out.dialogHasList = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0];
    return { unavailable:/Participant list unavailable/i.test(d?.innerText||''),
             txt:(d?.innerText||'').replace(/\s+/g,' ').slice(0,200) };},VS);
  return out;
};
