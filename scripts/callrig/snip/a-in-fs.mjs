export default async ({page}) => {
  const rd=()=>page.evaluate(()=>{
    const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='call-surface-fullscreen');
    return {label:b?b.getAttribute('aria-label'):null, pressed:b?b.getAttribute('aria-pressed'):null,
      fsEl: document.fullscreenElement?document.fullscreenElement.tagName:null};});
  const before=await rd();
  await page.click('button[data-testid="call-surface-fullscreen"]');
  await page.waitForTimeout(2500);
  const during=await rd();
  await page.click('button[data-testid="call-surface-fullscreen"]');
  await page.waitForTimeout(2500);
  const after=await rd();
  return {before, during, after};
};
