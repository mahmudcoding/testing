const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.keyboard.press('Escape').catch(()=>{});
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/call/V4OV3JBD5D8E77E',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(10000);
  await page.locator('button[aria-label="Participants"]').first().click().catch(e=>out.pErr=String(e).slice(0,40));
  await page.waitForTimeout(3000);
  out.admitLabels = await page.evaluate((vs)=>{const vis=eval(vs);
    return [...document.querySelectorAll('button[aria-label^="Admit"]')].filter(vis).map(b=>b.getAttribute('aria-label'));},VS);
  for(let i=0;i<10;i++){
    const b=page.locator('button[aria-label^="Admit"]').first();
    if(!(await b.count())) break;
    await b.click().catch(()=>{});
    await page.waitForTimeout(2400);
  }
  out.roster = await page.evaluate((vs)=>{const vis=eval(vs);
    const l=document.querySelector('[data-testid="participants-list"]');
    return l?{ header:(l.parentElement?.innerText||'').replace(/\s+/g,' ').slice(0,50),
      n:[...l.querySelectorAll('[data-testid="participant-row"]')].length,
      rows:[...l.querySelectorAll('[data-testid="participant-row"]')].map(r=>(r.innerText||'').replace(/\s+/g,' ').trim().slice(0,24))}:null;},VS);
  return out;
};
