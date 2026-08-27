const probe = `(() => {
  const vis = el => { if(!el) return false; const r=el.getBoundingClientRect(); if(!r.width||!r.height) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };
  const chLinks=[...document.querySelectorAll('a[href*="/c/"]')].filter(vis).map(a=>(a.textContent||'').trim().slice(0,20));
  const toggles=[...document.querySelectorAll('button')].filter(b=>vis(b)&&/sidebar/i.test(b.getAttribute('aria-label')||'')).map(b=>({l:b.getAttribute('aria-label'), x:Math.round(b.getBoundingClientRect().left)}));
  return {chLinks, toggles, mainLeft: Math.round((document.querySelector('main')?.getBoundingClientRect().left)||-1)};
})()`;
export default async ({page}) => {
  const out = {};
  await page.goto('https://airion-cargo.store/w/W4QEF1XTURESO01/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  out.before = await page.evaluate(probe);
  const btn = page.locator('button[aria-label="Collapse chat sidebar"]');
  out.collapseCount = await btn.count();
  if (out.collapseCount) {
    await btn.first().click();
    const trace=[];
    for (let i=0;i<12;i++){ await page.waitForTimeout(300); const s=await page.evaluate(probe); trace.push(s.chLinks.length + ':' + (s.toggles[0]?.l||'-').slice(0,10)); }
    out.trace = trace.join(' ');
    out.afterCollapse = await page.evaluate(probe);
  }
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  out.afterReload = await page.evaluate(probe);
  return out;
};
