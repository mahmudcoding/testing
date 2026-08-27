// Alice sits in qa-general; watch the NEVER-MUTED qa-private entry in the sidebar.
export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const read = () => page.evaluate(()=>{
    const vis = e => {const r=e.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const a=[...document.querySelectorAll('a[href*="/c/"]')].filter(vis).find(x=>/qa-private/.test(x.innerText));
    return a?(a.getAttribute('aria-label')||a.innerText.replace(/\s+/g,' ').trim()):'ABSENT';});
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCPRIVATE0001`,{waitUntil:'load'});
  await page.waitForTimeout(3500);
  const muteState = await page.evaluate(()=>{const b=document.querySelector('button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]');
    return b?b.getAttribute('aria-label')+' pressed='+b.getAttribute('aria-pressed'):'n/a';});
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`,{waitUntil:'load'});
  await page.waitForTimeout(3500);
  const atStart = await read();
  const t0=Date.now(); const seen=[]; let prev=atStart;
  for(let i=0;i<105;i++){ await page.waitForTimeout(300); const v=await read();
    if(v!==prev){ seen.push({t:Date.now()-t0, v}); prev=v; } }
  const beforeReload = await read();
  await page.reload({waitUntil:'load'}); await page.waitForTimeout(4200);
  return {targetMuteState:muteState, atStart, changesDuringWatch:seen, beforeReload, afterReload: await read()};
};
