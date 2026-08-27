const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const b = page.locator('button[aria-label="Mute"]').first();
  if(!(await b.count())) return { already:'muted-or-absent',
    labels: await page.evaluate((vs)=>{const vis=eval(vs);
      return [...document.querySelectorAll('button')].filter(vis).map(x=>x.getAttribute('aria-label')||'').filter(a=>/mute/i.test(a)).slice(0,3);},VS) };
  await b.click(); await page.waitForTimeout(1800);
  return { now: await page.evaluate((vs)=>{const vis=eval(vs);
    const x=[...document.querySelectorAll('button')].filter(vis).find(x=>/^(Mute|Unmute)$/.test(x.getAttribute('aria-label')||''));
    return x?x.getAttribute('aria-label'):null;},VS) };
};
