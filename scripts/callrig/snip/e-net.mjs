/* Reload a URL and report the API requests the page made. */
export default async ({ page }) => {
  const seen=[];
  page.on('request', r=>{ const u=r.url(); if(/\/api\/v1\//.test(u)) seen.push(r.method()+' '+u.replace(/^https?:\/\/[^/]+/,'')); });
  await page.goto(process.env.QA_URL, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(Number(process.env.QA_WAIT||6000));
  return {url:page.url(), reqs:[...new Set(seen)]};
};
