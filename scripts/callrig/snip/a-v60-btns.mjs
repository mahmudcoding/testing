const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(1000);
  return await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname,
      allButtons:[...document.querySelectorAll('button')].filter(vis)
        .map(b=>({t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,22), al:(b.getAttribute('aria-label')||'').slice(0,24)}))
        .filter(b=>b.t||b.al).slice(-18),
      tabs:[...document.querySelectorAll('button,[role="tab"]')].filter(vis).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).filter(t=>/\d+:\d\d/.test(t)) };},VS);
};
