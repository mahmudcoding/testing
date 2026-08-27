export default async ({page}) => {
  const t0=Date.now(), tl=[]; let last='';
  while (Date.now()-t0 < Number(process.env.QA_MAX||30000)) {
    const s = await page.evaluate(()=>{
      const vis=[...document.querySelectorAll('[role="status"],[role="alert"],[data-testid*="toast"],[class*="toast"]')]
        .filter(e=>{const r=e.getBoundingClientRect();
          return e.innerText.trim() && !/sr-only/.test((e.className||'').toString()) && r.width>20 && r.height>10;})
        .map(e=>e.innerText.replace(/\n+/g,' ').trim().slice(0,50));
      const dl=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')]
        .map(e=>e.innerText.replace(/\n+/g,' | ').trim().slice(0,60)).filter(t=>t.length>5);
      return {inCall: !!document.querySelector('[data-testid="call-toolbar"]'),
              toasts:vis, dlg:dl.slice(0,2)};
    });
    const k=JSON.stringify(s);
    if(k!==last){ tl.push({at:((Date.now()-t0)/1000).toFixed(1)+'s', ...s}); last=k; }
    await page.waitForTimeout(300);
  }
  return {timeline: tl.slice(0,12)};
};
