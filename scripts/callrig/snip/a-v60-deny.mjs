const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/call/V4OV71VVGQMD1YE',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(10000);
  await page.locator('button[aria-label="Participants"]').first().click().catch(()=>{});
  await page.waitForTimeout(3000);
  const d = page.locator('button[aria-label^="Deny"]').first();
  out.denyFound = await d.count()>0;
  if(out.denyFound){ out.label=await d.getAttribute('aria-label'); await d.click(); await page.waitForTimeout(5000); }
  out.after = await page.evaluate((vs)=>{const vis=eval(vs);
    const l=document.querySelector('[data-testid="participants-list"]');
    return { n:l?[...l.querySelectorAll('[data-testid="participant-row"]')].length:null,
      waiting:[...document.querySelectorAll('button[aria-label^="Admit"],button[aria-label^="Deny"]')].filter(vis).length };},VS);
  return out;
};
