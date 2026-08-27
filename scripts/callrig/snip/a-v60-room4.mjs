const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={}; const net=[];
  page.on('response', async r=>{const u=r.url(); if(/breakout/.test(u)&&r.request().method()!=='GET'){
    net.push({m:r.request().method(),u:u.split('/api/v1/')[1]?.slice(0,50),s:r.status()});}});
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(800);
  const nb = page.locator('button',{hasText:/^New Side Room$/}).first();
  if(!(await nb.count())){ await page.locator('button[aria-label="Side Rooms"]').first().click().catch(()=>{}); await page.waitForTimeout(2500); }
  await page.locator('button',{hasText:/^New Side Room$/}).first().click();
  await page.waitForTimeout(2500);
  const ti=await page.$('input[placeholder="e.g. Design sync"]');
  if(ti){ await ti.click(); await page.keyboard.type('Rec Room',{delay:25}); }
  await page.waitForTimeout(500);
  const bp = page.locator('[role="dialog"] button, aside button',{hasText:/QA Bob/}).first();
  if(await bp.count()){ await bp.click().catch(()=>{}); await page.waitForTimeout(800); out.pickedBob=true; }
  await page.locator('button',{hasText:/^Create room$/}).first().click();
  await page.waitForTimeout(6000);
  out.requests=net;
  out.panel = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop()||document.body;
    return (d.innerText||'').replace(/\s+/g,' ').slice(0,200);},VS);
  return out;
};
