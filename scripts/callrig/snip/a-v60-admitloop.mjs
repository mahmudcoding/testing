const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/call/V4OV6KV2VFMRKLC',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(11000);
  await page.locator('button[aria-label="Participants"]').first().click().catch(()=>{});
  await page.waitForTimeout(3000);
  for(let i=0;i<14;i++){
    const aa=page.locator('button[aria-label^="Admit all"]').first();
    if(await aa.count()){ await aa.click().catch(()=>{}); await page.waitForTimeout(5000); continue; }
    const b=page.locator('button[aria-label^="Admit"]').first();
    if(!(await b.count())) break;
    await b.click().catch(()=>{}); await page.waitForTimeout(3000);
  }
  out.roster = await page.evaluate((vs)=>{const vis=eval(vs);
    const l=document.querySelector('[data-testid="participants-list"]');
    return l?{ header:(l.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,40),
      n:[...l.querySelectorAll('[data-testid="participant-row"]')].length}:null;},VS);
  return out;
};
