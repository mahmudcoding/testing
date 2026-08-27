const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const label = () => page.evaluate((vs)=>{const vis=eval(vs);
    const b=[...document.querySelectorAll('button')].filter(vis)
      .find(b=>/^Turn camera (on|off)$/.test(b.getAttribute('aria-label')||''));
    return b?b.getAttribute('aria-label'):null;},VS);
  const before = await label();
  if(!before) return {before:null, note:'no camera toggle visible'};
  await page.locator(`button[aria-label="${before}"]`).first().click();
  await page.waitForTimeout(4000);
  return { before, after: await label() };
};
