export default async ({ page }) => {
  const TOK='wWS6o2n4-h-y34y9KQ5CS-jM7XvQA80Ekl_TSTk8OB4=';
  const seen=new Set();
  const h=r=>{const u=r.url(); if(u.includes('workspace-invites')) seen.add(r.request().method()+' '+r.status()+' '+u.split('/api/v1/')[1].split('?')[0].slice(0,40));};
  page.on('response',h);
  await page.goto(`https://airion-cargo.store/invite/${encodeURIComponent(TOK)}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  page.off('response',h);
  return { requests:[...seen], ...await page.evaluate(() => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const t=(document.body.innerText||'').replace(/\s+/g,' ');
    return { url: location.pathname.slice(0,30)+location.search.slice(0,20), text:t.slice(0,260),
      controls:[...document.querySelectorAll('button,a')].filter(vis)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ')).filter(Boolean).slice(0,8) };
  })};
};
