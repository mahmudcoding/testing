export default async ({page}) => {
  const t0=Date.now(), tl=[]; let last='';
  while (Date.now()-t0 < Number(process.env.QA_MAX||30000)) {
    const s = await page.evaluate(()=>{
      const m=document.querySelector('main');
      return {main:(m?m.innerText:'').replace(/\n+/g,' | ').slice(0,140),
              inCall: !!document.querySelector('[data-testid="call-toolbar"]'),
              toasts:[...document.querySelectorAll('[data-testid*="toast"],[role="status"],[role="alert"]')]
                       .map(e=>e.innerText.replace(/\n+/g,' ').trim().slice(0,70)).filter(Boolean)};
    });
    const k=JSON.stringify(s);
    if (k!==last){ tl.push({at:((Date.now()-t0)/1000).toFixed(1)+'s', ...s}); last=k; }
    await page.waitForTimeout(700);
  }
  return {timeline: tl.slice(0,10)};
};
