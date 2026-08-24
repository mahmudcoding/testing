export default async ({page}) => {
  const raise = await page.$('button[aria-label="Raise hand"]');
  const lower = await page.$('button[aria-label="Lower hand"]');
  const tiles = await page.evaluate(() => {
    return [...document.querySelectorAll('[data-testid="participant-tile"]')].map(t => ({
      text: t.innerText.replace(/\n+/g,' | ').slice(0,120),
      imgs: [...t.querySelectorAll('img,svg,[aria-label]')].map(i=>i.getAttribute('aria-label')).filter(Boolean).slice(0,8),
      html: t.innerHTML.length
    }));
  });
  const raisedAny = await page.evaluate(() => {
    const hits = [];
    document.querySelectorAll('[aria-label*="hand" i], [data-testid*="hand" i], [class*="hand" i]').forEach(e=>hits.push((e.getAttribute('aria-label')||e.getAttribute('data-testid')||e.className||'').toString().slice(0,60)));
    return hits.slice(0,15);
  });
  return {hasRaise: !!raise, hasLower: !!lower, tiles, raisedAny};
};
