// Does ANY in-app (same-document) navigation refresh the unread badge, or only a reload?
export default async ({page}) => {
  const VIS=`(e=>{const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1;
    while(n){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; o*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return o>0.05;})`;
  const ROWS=`(()=>{const vis=${VIS};
    return [...document.querySelectorAll('nav a[aria-label],nav button[aria-label],aside a[aria-label],aside button[aria-label]')]
      .filter(e=>vis(e)&&/qa-/.test(e.getAttribute('aria-label')||''))
      .map(e=>({al:e.getAttribute('aria-label'), t:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,40)}));})()`;
  const out={};
  out.navLinks = await page.evaluate(`(()=>{const vis=${VIS};
    return [...document.querySelectorAll('a[href]')].filter(vis).map(a=>({l:(a.getAttribute('aria-label')||a.innerText||'').replace(/\\s+/g,' ').trim().slice(0,26), h:a.getAttribute('href').slice(0,50)})).filter(x=>x.l).slice(0,20);})()`);
  out.before = await page.evaluate(ROWS);
  out.navCountBefore = await page.evaluate(()=>performance.getEntriesByType('navigation').length);
  const link = page.locator('a[href*="/chat/saved"],a[href*="/chat/mentions"],a[href*="/files"]').filter({hasNotText:'zzz'}).first();
  if(await link.count()){
    await link.scrollIntoViewIfNeeded().catch(()=>{});
    await link.click({timeout:8000}).catch(e=>out.clickErr=String(e).slice(0,60));
    await page.waitForTimeout(5000);
  } else out.noLink=true;
  out.after = {url:page.url().replace(/^https:\/\/[^/]+/,''), rows: await page.evaluate(ROWS)};
  out.navCountAfter = await page.evaluate(()=>performance.getEntriesByType('navigation').length);
  out.sameDocument = out.navCountBefore===out.navCountAfter;
  return out;
};
