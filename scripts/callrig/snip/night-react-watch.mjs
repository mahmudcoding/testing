export default async ({page}) => {
  const t0=Date.now(), tl=[]; let last='';
  while (Date.now()-t0 < Number(process.env.QA_MAX||25000)) {
    const s = await page.evaluate(()=>{
      const b=[...document.querySelectorAll('button')].find(x=>/^Send reaction$/.test(x.getAttribute('aria-label')||''));
      return {present:!!b, disabled:b?b.disabled:null,
              ariaDisabled:b?b.getAttribute('aria-disabled'):null,
              tid:b?b.getAttribute('data-testid'):null};});
    const k=JSON.stringify(s);
    if(k!==last){ tl.push({at:((Date.now()-t0)/1000).toFixed(1)+'s', ...s}); last=k; }
    await page.waitForTimeout(300);
  }
  return {timeline: tl.slice(0,8)};
};
