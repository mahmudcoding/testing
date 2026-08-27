export default async ({page}) => {
  await page.waitForTimeout(8000);
  return page.evaluate(()=>{
    const log=(window.__a11y||[]).map(e=>`${e.t}s: ${e.v}`);
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const hit=els.reverse().find(e=>/QA-A11Y-RC/.test(e.innerText||''));
    return {announcements:log,
      renderedInFeed:hit?(hit.innerText||'').replace(/\s+/g,' ').trim().slice(-46):'not in feed'};});
};
