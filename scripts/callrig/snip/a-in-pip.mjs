export default async ({page}) => {
  const rd=()=>page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]');
    const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='call-surface-minimize');
    return {overlay: !!r, minBtn: b?b.getAttribute('aria-label'):null,
      pip: !!document.querySelector('[data-testid="pip-mini-call"],[data-testid="draggable-pip"]'),
      url: location.pathname};});
  const before=await rd();
  await page.click('button[data-testid="call-surface-minimize"]');
  await page.waitForTimeout(3000);
  const after=await rd();
  return {before, after};
};
