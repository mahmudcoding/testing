const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/calendar/i.test(u)&&r.request().method()!=='GET'){
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,44),s:r.status(),req:(r.request().postData()||'').slice(0,300)});}});
  const tag='V60 Edit '+Math.floor(Date.now()/1000%100000);
  // create a FUTURE meeting
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.locator('button',{hasText:/^New meeting$/}).first().click();
  await page.waitForTimeout(2600);
  await page.evaluate(([vs,v])=>{const vis=eval(vs);const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0];
    const i=[...d.querySelectorAll('input')].filter(vis)[0];
    const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
    s.call(i,v); i.dispatchEvent(new Event('input',{bubbles:true}));},[VS,tag]);
  await page.waitForTimeout(600);
  await page.locator('[role="dialog"] button',{hasText:/^Schedule meeting$/}).first().click();
  await page.waitForTimeout(5500);
  out.created = net.filter(n=>n.m==='POST').map(n=>({s:n.s, body:n.req.slice(0,150)}));
  net.length=0;
  // reopen it and change ONLY the title
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5200);
  const chip = page.locator('[data-testid="calendar-event-chip"]',{hasText:tag.split(' ')[2]}).first();
  out.chipFound = await chip.count()>0;
  if(!out.chipFound) return out;
  await chip.scrollIntoViewIfNeeded(); await chip.click(); await page.waitForTimeout(3000);
  const ed = page.locator('[role="dialog"] button[aria-label="Edit"]').first();
  out.editAvailable = await ed.count()>0;
  if(!out.editAvailable) return out;
  await ed.click(); await page.waitForTimeout(3200);
  net.length=0;
  const ti=await page.$('[role="dialog"] input');
  if(ti){ await ti.click({clickCount:3}); await page.keyboard.type(tag+' RENAMED',{delay:14}); }
  await page.waitForTimeout(700);
  for(const rx of [/^Save changes$/,/^Save$/,/^Update/,/^Schedule meeting$/]){
    const b=page.locator('[role="dialog"] button').filter({hasText:rx}).first();
    if(await b.count()){ await b.click().catch(()=>{}); out.saveBtn=String(rx); break; } }
  await page.waitForTimeout(6000);
  out.editRequests = net;
  return out;
};
