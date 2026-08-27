export default async ({page}) => {
  // close any open dialog first
  await page.evaluate(()=>{const b=[...document.querySelectorAll('[role="dialog"] button,[role="alertdialog"] button')]
    .find(x=>/^(Cancel|Close)$/i.test((x.getAttribute('aria-label')||x.textContent||'').trim())); if(b) b.click();});
  await page.waitForTimeout(1200);
  const label = async () => await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>/^(Mute|Unmute)$/.test((x.getAttribute('aria-label')||'').trim()));
    return b?b.getAttribute('aria-label'):null;});
  const toasts = async () => await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"],[data-testid*="toast"]')]
    .map(e=>e.innerText.replace(/\n+/g,' ').trim()).filter(Boolean).slice(0,4));
  const out=[];
  for (let i=0;i<3;i++){
    const before = await label();
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button')]
      .find(x=>/^(Mute|Unmute)$/.test((x.getAttribute('aria-label')||'').trim())); if(b) b.click();});
    let seen=[]; 
    for (let t=0;t<12;t++){ await page.waitForTimeout(500); const cur=await toasts();
      for(const c of cur) if(!seen.includes(c)) seen.push(c); }
    out.push({i, clicked:before, nowLabel: await label(), toasts:seen.slice(0,4)});
  }
  return {runs: out};
};
