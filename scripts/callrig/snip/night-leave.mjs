export default async ({page}) => {
  const l = page.locator('[data-testid="call-controls-leave"]');
  await l.click();
  await page.waitForTimeout(2000);
  // confirm dialog if present
  const btns = await page.$$('[role="dialog"] button');
  let confirmed=null;
  for (const b of btns) { const t=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if (/^(Leave|Leave call)$/i.test(t)) { await b.click(); confirmed=t; break; } }
  await page.waitForTimeout(5000);
  return {confirmed, url: page.url(), txt: await page.evaluate(()=>(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,180))};
};
