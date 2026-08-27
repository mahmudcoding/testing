const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const reqs=[];
  page.on('response', async r=>{const u=r.url(); if(/\/api\/v1\/calendar/.test(u)&&r.request().method()!=='GET'){
    let b=null;try{b=(await r.text()).slice(0,120);}catch(e){}
    reqs.push({m:r.request().method(),u:u.split('/api/v1/')[1].slice(0,44),s:r.status(),req:(r.request().postData()||'').slice(0,120),res:b});}});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.chips = await page.evaluate(()=>[...document.querySelectorAll('[data-testid="calendar-event-chip"]')].map(c=>(c.innerText||'').replace(/\s+/g,' ').slice(0,44)));
  const chip = page.locator('[data-testid="calendar-event-chip"]', { hasText: 'Participant Check' }).first();
  out.chipVisible = await chip.count()>0;
  if(!out.chipVisible) return out;
  await chip.scrollIntoViewIfNeeded(); await chip.click(); await page.waitForTimeout(2500);
  const det = () => page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0]; if(!d)return{noDialog:true};
    return { txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,340),
             btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||'').trim().slice(0,16)).filter(Boolean).slice(0,10) };},VS);
  out.detailsAsBob = await det();
  // RSVP Yes
  const yes = page.locator('[role="dialog"] button', { hasText: /^Yes$/ }).first();
  if(await yes.count()){ await yes.click();
    const poll=[]; for(let i=0;i<8;i++){ poll.push({t:i*450,...(await det())}); await page.waitForTimeout(450); }
    out.afterYes = poll[poll.length-1]; }
  out.requests=reqs;
  return out;
};
