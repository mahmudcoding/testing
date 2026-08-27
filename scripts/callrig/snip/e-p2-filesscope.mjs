export default async ({page}) => {
  const out=[];
  for (const tab of ['All files','Shared with me','qa-general']) {
    const b = page.locator('button').filter({hasText:new RegExp('^'+tab)}).first();
    if (!(await b.count())) { out.push({tab, note:'not found'}); continue; }
    await b.click(); await page.waitForTimeout(3500);
    const r = await page.evaluate(function(){
      const t=(document.body.innerText||'').replace(/\s+/g,' ');
      const items=document.querySelectorAll('[data-testid="virtuoso-item-list"] > *').length;
      return {probe: t.includes('qa-e-reconnect-probe'), items,
              around: (function(){const i=t.indexOf('qa-e-reconnect'); return i<0?null:t.slice(Math.max(0,i-60), i+60);})()};
    });
    out.push({tab, ...r});
  }
  return out;
};
