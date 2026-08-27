export default async ({page}) => {
  const ws='W4QBF1XTURESO01';
  // land somewhere else so qa-general stays unread
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/mentions`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const mentions = await page.evaluate(()=>{
    const main=(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ');
    return {counts:(main.match(/All \(\d+\)\s*Unread \(\d+\)/)||[''])[0],
            hasBroadcast:/broadcast/i.test(main), len:main.length,
            head: main.slice(0,240)};
  });
  const unread = await page.evaluate(async(ws)=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/unread`,{credentials:'include'});
    return (await r.text()).slice(0,320);
  }, ws);
  const sidebar = await page.evaluate(()=>[...document.querySelectorAll('a')]
    .filter(e=>{const r=e.getBoundingClientRect(); return r.width>0&&r.x<380&&/qa-general/.test(e.getAttribute('aria-label')||e.innerText||'');})
    .map(e=>({t:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,30), l:(e.getAttribute('aria-label')||'').slice(0,40)})));
  return {mentions, unread, sidebar};
};
