export default async ({ page }) => {
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/alice-where.png'});
  return await page.evaluate(()=>({
    url:location.pathname+location.search, vis:document.visibilityState,
    bodyLen:document.body.innerText.length,
    head:document.body.innerText.replace(/\s+/g,' ').slice(0,300),
    msgNodes:document.querySelectorAll('[data-message-id]').length }));
};
