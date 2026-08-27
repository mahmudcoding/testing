const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  const sn = page.locator('button', { hasText: /^Start now$/ }).first();
  out.startNowFound = await sn.count()>0;
  if(!out.startNowFound) return out;
  await sn.click();
  await page.waitForTimeout(3000);
  out.afterClick = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    return { url:location.pathname, dialog: d?(d.innerText||'').replace(/\s+/g,' ').slice(0,240):null,
      btns:[...(d||document.querySelector('main')||document.body).querySelectorAll('button')].filter(vis)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().slice(0,24)).filter(Boolean).slice(0,16) };},VS);
  return out;
};
