export default async ({page}) => {
  const b = await page.$('[data-testid="call-nerd-stats-toggle"]');
  if (b && (await b.getAttribute('aria-pressed'))!=='true') { await b.click(); await page.waitForTimeout(4500); }
  return await page.evaluate(()=>{
    const tiles=[...document.querySelectorAll('[data-testid="live-stats-tile"]')];
    return {count: tiles.length, tiles: tiles.map(t=>t.innerText.replace(/\n+/g,' | ').slice(0,220))};
  });
};
