const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const b = page.locator('button[aria-label="Turn camera on"]').first();
  const found = await b.count()>0;
  if(found){ await b.click(); await page.waitForTimeout(5000); }
  return await page.evaluate((vs)=>{const vis=eval(vs);
    return { found:true, camBtn:[...document.querySelectorAll('button')].filter(vis).map(x=>x.getAttribute('aria-label')||'').filter(a=>/camera/i.test(a)).slice(0,3),
      videos:[...document.querySelectorAll('video')].map(v=>({w:v.videoWidth,h:v.videoHeight,paused:v.paused})) };},VS);
};
