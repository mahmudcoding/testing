export default async ({page}) => {
  const pip = await page.$('[data-testid="draggable-pip"]');
  if (!pip) return {note:'no pip', url: page.url()};
  const btns = await pip.$$('button');
  let clicked=null;
  for (const b of btns) { const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if (/expand/i.test(l)) { await b.click(); clicked=l; break; } }
  await page.waitForTimeout(4000);
  return await page.evaluate((c)=>({clicked:c, url:location.href, overlay: !!document.querySelector('[data-testid="call-overlay-expanded"]'),
    tiles: document.querySelectorAll('[data-testid="participant-tile"]').length}), clicked);
};
