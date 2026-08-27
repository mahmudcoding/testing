export default async ({page, ctx}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  const before=await page.evaluate(()=>({
    n:document.querySelectorAll('main [data-message-id]').length,
    last:(()=>{const e=[...document.querySelectorAll('main [data-message-id]')].slice(-1)[0];
      return e? (e.innerText||'').replace(/\s+/g,' ').slice(-40):null;})()}));
  await ctx.setOffline(true);
  await page.waitForTimeout(1500);
  const offlineState=await page.evaluate(()=>({
    online:navigator.onLine,
    vis:document.visibilityState,
    banner:[...document.querySelectorAll('body *')].filter(e=>e.children.length===0)
      .filter(e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;})
      .map(e=>(e.textContent||'').trim())
      .filter(t=>/offline|connect|reconnect|no internet/i.test(t)&&t.length<60)}));
  return {before, offlineState};
};
