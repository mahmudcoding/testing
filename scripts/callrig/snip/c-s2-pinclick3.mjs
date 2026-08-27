export default async ({page}) => {
  await page.evaluate(()=>{ window.__clicks=[];
    document.addEventListener('click',(e)=>{const t=e.target.closest('button')||e.target;
      window.__clicks.push(((t.getAttribute&&t.getAttribute('aria-label'))||'')+'|'+
        (t.innerText||'').replace(/\s+/g,' ').trim().slice(0,24));},true); });
  const jump = page.locator('button[aria-label="Jump to pinned message"]');
  const banner = jump.locator('xpath=../..');
  const viewAll = banner.locator('button', {hasText:'View all'}).first();
  const res={};
  res.jumpCount = await jump.count();
  res.viewAllCount = await viewAll.count();
  try { await viewAll.click({timeout:5000}); res.viewAllClick='ok'; }
  catch(e){ res.viewAllClick='FAIL '+String(e.message).split('\n')[0].slice(0,70); }
  await page.waitForTimeout(3000);
  res.afterViewAll = await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return {dialogs:[...document.querySelectorAll('[role="dialog"]')].filter(v)
        .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,80)),
      clicks:window.__clicks.slice()};
  });
  await page.evaluate(()=>{window.__clicks=[];});
  try { await jump.click({timeout:5000}); res.jumpClick='ok'; }
  catch(e){ res.jumpClick='FAIL '+String(e.message).split('\n')[0].slice(0,70); }
  await page.waitForTimeout(3000);
  res.afterJump = await page.evaluate(()=>({clicks:window.__clicks.slice(),
    url:location.pathname+location.search,
    dialogs:document.querySelectorAll('[role="dialog"]').length}));
  return res;
};
