export default async ({page}) => {
  const ws='W4QBF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QBGENERAL0001`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const chans = await page.evaluate(async(ws)=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/channels`,{credentials:'include'});
    const t=await r.text(); return {s:r.status, body:t.slice(0,700)};
  }, ws);
  const sidebar = await page.evaluate(()=>{
    const btns=[...document.querySelectorAll('button,a')].filter(e=>{
      const r=e.getBoundingClientRect(); return r.width>0&&r.height>0&&r.x<380;})
      .map(e=>({t:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,28),
                l:(e.getAttribute('aria-label')||'').slice(0,34),
                h:(e.getAttribute('href')||'').slice(0,44)}))
      .filter(x=>x.t||x.l);
    return btns.slice(0,40);
  });
  return {chans, sidebar};
};
