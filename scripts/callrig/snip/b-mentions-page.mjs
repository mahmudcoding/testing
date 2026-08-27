export default async ({page}) => {
  const ws='W4QBF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/mentions`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const dom = await page.evaluate(()=>({
    url:location.href.replace(/^https:\/\/[^/]+/,''),
    heading:(document.querySelector('h1,h2')?.innerText||'').slice(0,60),
    msgs:[...document.querySelectorAll('[data-message-id]')].map(a=>(a.innerText||'').replace(/\s+/g,' ').slice(0,80)),
    bodyText:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,300)
  }));
  const unread = await page.evaluate(async(ws)=>{
    const r=await fetch(`/api/v1/workspaces/${ws}/unread`,{credentials:'include'});
    const t=await r.text(); return {s:r.status, body:t.slice(0,400)};
  }, ws);
  return {dom, unread};
};
