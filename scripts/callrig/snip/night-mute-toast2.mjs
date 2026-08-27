export default async ({page}) => {
  const toasts = async () => await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"],[data-testid*="toast"]')]
    .map(e=>e.innerText.replace(/\n+/g,' ').trim()).filter(Boolean));
  const waitClear = async (max=25000) => { const t0=Date.now();
    while(Date.now()-t0<max){ const c=await toasts(); if(c.length===0) return true; await page.waitForTimeout(700);} return false; };
  const out=[];
  for (let i=0;i<3;i++){
    const cleared = await waitClear();
    const pre = await toasts();
    const before = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')]
      .find(x=>/^(Mute|Unmute)$/.test((x.getAttribute('aria-label')||'').trim())); return b?b.getAttribute('aria-label'):null;});
    await page.evaluate(()=>{const b=[...document.querySelectorAll('button')]
      .find(x=>/^(Mute|Unmute)$/.test((x.getAttribute('aria-label')||'').trim())); if(b) b.click();});
    const t0=Date.now(); let first=null;
    while(Date.now()-t0<9000 && !first){ await page.waitForTimeout(400);
      const c=await toasts(); if(c.length) first={at:((Date.now()-t0)/1000).toFixed(1)+'s', text:c.join(' / ')}; }
    out.push({i, clearedFirst:cleared, toastsBeforeClick:pre, clicked:before, newToast:first});
  }
  return {runs:out};
};
