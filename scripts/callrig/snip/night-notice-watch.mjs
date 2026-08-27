export default async ({page}) => {
  const t0=Date.now(), tl=[]; let last='';
  while (Date.now()-t0 < Number(process.env.QA_MAX||25000)) {
    const s = await page.evaluate(()=>{
      const vis=[...document.querySelectorAll('[role="status"],[role="alert"],[role="alertdialog"],[class*="toast"],[data-testid*="prompt"]')]
        .filter(e=>{const r=e.getBoundingClientRect();
          return e.innerText.trim() && !/sr-only/.test((e.className||'').toString()) && r.width>20 && r.height>10;})
        .map(e=>e.innerText.replace(/\n+/g,' ').trim().slice(0,70));
      const mic=[...document.querySelectorAll('button')]
        .find(b=>/^(Mute|Unmute)$/.test(b.getAttribute('aria-label')||''));
      return {notices:vis, mic:mic?mic.getAttribute('aria-label'):null};});
    const k=JSON.stringify(s);
    if(k!==last){ tl.push({at:((Date.now()-t0)/1000).toFixed(1)+'s', ...s}); last=k; }
    await page.waitForTimeout(300);
  }
  return {timeline: tl.slice(0,10)};
};
