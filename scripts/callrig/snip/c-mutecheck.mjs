export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`,{waitUntil:'load'});
  await page.waitForTimeout(4000);
  const btn = await page.evaluate(()=>{const b=document.querySelector('button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]');
    return b?{l:b.getAttribute('aria-label'),p:b.getAttribute('aria-pressed')}:null;});
  // sidebar entry right after navigating away
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`,{waitUntil:'load'});
  await page.waitForTimeout(3500);
  const side = await page.evaluate(()=>{
    const vis = e => {const r=e.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const a=[...document.querySelectorAll('a[href*="/c/"]')].filter(vis).find(x=>/qa-general/.test(x.innerText));
    return a?a.getAttribute('aria-label'):'ABSENT';});
  return {muteButton: btn, sidebarAfterNav: side};
};
