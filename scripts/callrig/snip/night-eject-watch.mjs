export default async ({page}) => {
  const t0=Date.now(), tl=[]; let last='';
  while (Date.now()-t0 < Number(process.env.QA_MAX||45000)) {
    const s = await page.evaluate(()=>{
      const tb=document.querySelector('[data-testid="call-top-bar"]');
      const vis=[...document.querySelectorAll('[role="status"],[role="alert"],[data-testid*="toast"],[class*="toast"]')]
        .filter(e=>{const r=e.getBoundingClientRect();
          return e.innerText.trim() && !/sr-only/.test((e.className||'').toString()) && r.width>20 && r.height>10;})
        .map(e=>e.innerText.replace(/\n+/g,' ').trim().slice(0,60));
      const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')]
        .map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,90)).filter(t=>t.length>10);
      return {inCall: !!document.querySelector('[data-testid="call-toolbar"]'),
        top: tb?tb.innerText.replace(/\n+/g,' | ').slice(0,45):null,
        toasts:vis, dialogs:d.slice(0,2),
        main:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,70)};
    });
    const k=JSON.stringify([s.inCall,s.toasts,s.dialogs,s.main.slice(0,40)]);
    if(k!==last){ tl.push({at:((Date.now()-t0)/1000).toFixed(1)+'s', ...s}); last=k; }
    await page.waitForTimeout(600);
  }
  return {timeline: tl.slice(0,9)};
};
