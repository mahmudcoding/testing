export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const routes = (process.env.D_ROUTES||'').split(',').filter(Boolean);
  const out=[];
  for (const r of routes) {
    const fails=[], errs=[];
    const onResp = resp => { if (resp.url().includes('/api/v1/') && resp.status()>=400) fails.push(resp.status()+' '+resp.request().method()+' '+resp.url().replace('https://airion-cargo.store','')); };
    const onErr = m => { if (m.type()==='error') errs.push((m.text()||'').slice(0,140)); };
    page.on('response', onResp); page.on('console', onErr);
    await page.goto(`https://airion-cargo.store/w/${WS}/${r}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3800);
    const dom = await page.evaluate(() => {
      const main = document.querySelector('main') || document.body;
      const txt = (main.innerText||'').replace(/\s+/g,' ').trim();
      const btns=[]; main.querySelectorAll('button').forEach(b=>{const q=b.getBoundingClientRect(); if(q.width>0&&q.height>0) btns.push(((b.innerText||'').trim()||b.getAttribute('aria-label')||'?').slice(0,32));});
      const inputs=[]; main.querySelectorAll('input,textarea,select').forEach(b=>{const q=b.getBoundingClientRect(); if(q.width>0&&q.height>0) inputs.push((b.getAttribute('aria-label')||b.getAttribute('name')||b.getAttribute('placeholder')||b.type||'?').slice(0,32));});
      return {path:location.pathname+location.search, len:txt.length, txt:txt.slice(0,420), btns:btns.slice(0,30), inputs:inputs.slice(0,15)};
    });
    page.off('response', onResp); page.off('console', onErr);
    out.push({route:r, ...dom, fails:fails.slice(0,6), errs:errs.slice(0,3)});
  }
  return out;
};
