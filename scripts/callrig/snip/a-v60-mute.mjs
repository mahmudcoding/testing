const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const b = page.locator('button[aria-label="Mute"], button[aria-label="Unmute"]').first();
  const before = await b.getAttribute('aria-label').catch(()=>null);
  await b.click().catch(()=>{});
  await page.waitForTimeout(2500);
  const after = await page.evaluate((vs)=>{const vis=eval(vs);
    const x=[...document.querySelectorAll('button')].filter(vis).find(x=>/^(Mute|Unmute)$/.test(x.getAttribute('aria-label')||''));
    return x?x.getAttribute('aria-label'):null;},VS);
  return { before, after };
};
