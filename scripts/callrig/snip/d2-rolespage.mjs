export default async ({ page }) => {
  const WS='W4QDF1XTURESO01';
  const reqs = [];
  const h = res => { const u=res.url(); if (u.includes('/api/v1/')) reqs.push(res.status()+' '+u.split('/api/v1/')[1].split('?')[0].slice(0,60)); };
  page.on('response', h);
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=company`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  page.off('response', h);
  const r = await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const main = document.querySelector('main')||document.body;
    // strip the nav out: find the content region after the breadcrumb
    const all=(main.innerText||'').replace(/\s+/g,' ');
    const i=all.indexOf('Settings › Roles');
    const content = i>=0 ? all.slice(i) : all;
    return { fullContent: content.slice(0,700),
      buttons: [...main.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean),
      tablike: [...main.querySelectorAll('[role=tab],[role=row],tbody tr')].filter(vis).map(e=>(e.innerText||'').trim().replace(/\s+/g,' ').slice(0,40)),
      mentionsRoleNames: ['Member','Admin','Guest'].filter(n=>new RegExp('\\b'+n+'\\b').test(content)) };
  });
  return { requests: [...new Set(reqs)], ...r };
};
