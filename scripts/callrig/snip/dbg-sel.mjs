export default async ({page}) => {
  const r = {};
  r.frames = page.frames().map(f=>f.url().slice(0,80));
  r.all_textarea = (await page.$$('textarea')).length;
  r.locator_count = await page.locator('textarea').count();
  r.attr = await page.evaluate(()=>{const t=document.querySelector('textarea'); return t? JSON.stringify({al:t.getAttribute('aria-label'), ph:t.placeholder, cls:t.className.slice(0,60), rect:t.getBoundingClientRect().toJSON()}) : 'none';});
  r.byattr = (await page.$$('textarea[aria-label]')).length;
  r.starts = (await page.$$('textarea[aria-label^="Message"]')).length;
  return r;
};
