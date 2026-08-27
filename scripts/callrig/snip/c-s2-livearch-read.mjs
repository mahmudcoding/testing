export default async ({page}) => {
  await page.waitForTimeout(18000);
  const live=await page.evaluate(()=>({log:(window.__a||[]).map(e=>`${e.t}s: ${e.v}`)}));
  const now=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const c=document.querySelector('div[contenteditable][aria-label="Compose message"]');
    const main=document.querySelector('main');
    const txt=main?(main.innerText||''):'';
    return {composer:!!c, url:location.pathname.slice(-14),
      archivedBanner:/archived/i.test(txt),
      bannerText:(txt.match(/[^.]*archived[^.]*\./i)||[''])[0].slice(0,90),
      msgs:document.querySelectorAll('main [data-message-id]').length,
      toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].filter(v)
        .map(e=>(e.innerText||'').trim().slice(0,60)).filter(Boolean).slice(0,2)};});
  await page.reload(); await page.waitForTimeout(11000);
  const after=await page.evaluate(()=>{
    const c=document.querySelector('div[contenteditable][aria-label="Compose message"]');
    const main=document.querySelector('main');
    const txt=main?(main.innerText||''):'';
    return {composer:!!c, archivedBanner:/archived/i.test(txt),
      bannerText:(txt.match(/[^.]*archived[^.]*\./i)||[''])[0].slice(0,90)};});
  return {liveLog:live.log, liveState:now, afterReload:after};
};
