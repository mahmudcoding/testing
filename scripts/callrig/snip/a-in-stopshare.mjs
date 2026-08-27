export default async ({page}) => {
  const c = await page.evaluate(()=>{const r=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const b=[...r.querySelectorAll('button')].find(x=>x.getAttribute('data-testid')==='call-controls-screen-share');
    if(!b) return {err:'none'}; const l=b.getAttribute('aria-label'); b.click(); return {was:l};});
  await page.waitForTimeout(5000);
  return c;
};
