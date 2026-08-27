export default async ({page}) => {
  const ws='W4QCF1XTURESO01', dm='C4OWSYMJ03CFIKL';   // alice <-> dave
  await page.goto(`https://airion-cargo.store/w/${ws}/d/${dm}`);
  await page.waitForTimeout(11000);
  const header=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...new Set([...document.querySelectorAll('button,a')].filter(v)
      .filter(e=>{const r=e.getBoundingClientRect();return r.top<130 && r.left>400;})
      .map(e=>(e.getAttribute('aria-label')||e.innerText||'(unnamed)').replace(/\s+/g,' ').trim().slice(0,32)))];});
  const out={headerControls:header};
  // is there a details panel for a DM?
  const cand=header.find(t=>/details|profile|info/i.test(t));
  out.detailsControl=cand||null;
  if(cand){
    await page.locator(`button[aria-label="${cand}"]`).first().click({timeout:6000}).catch(()=>{});
    await page.waitForTimeout(4000);
    out.panel=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const W=innerWidth;
      const tabs=[...document.querySelectorAll('button[aria-selected]')].filter(v)
        .map(e=>`${(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,12)}=${e.getAttribute('aria-selected')}`);
      const pane=[...document.querySelectorAll('div,section,aside')].filter(v)
        .filter(e=>{const b=e.getBoundingClientRect();return b.left>W*0.7&&b.width>250&&b.height>250;})
        .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
      return {tabs, text:pane?(pane.innerText||'').replace(/\s+/g,' ').trim().slice(0,220):'NO-PANE'};});
  }
  return out;
};
