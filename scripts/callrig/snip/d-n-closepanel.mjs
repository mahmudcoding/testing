export default async ({page}) => {
  const out={};
  for (const t of ['call-controls-chat-toggle','call-controls-people-toggle','call-controls-settings-toggle']) {
    const b = page.locator(`[data-testid="${t}"]`);
    if (await b.count()>0 && await b.first().getAttribute('aria-pressed')==='true'){ await b.first().click(); await page.waitForTimeout(1200); out[t]='closed'; }
  }
  out.toolbar = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    return [...document.querySelectorAll('button')].filter(vis).map(x=>({l:(x.getAttribute('aria-label')||x.innerText||'').trim().replace(/\s+/g,' '),tid:x.dataset.testid||null,dis:x.disabled||x.getAttribute('aria-disabled')})).filter(x=>x.l).slice(-22);
  });
  return out;
};
