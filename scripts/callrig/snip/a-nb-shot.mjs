export default async ({page}) => {
  const url = process.env.QA_URL2 || 'http://127.0.0.1:8899/';
  await page.goto(url, {waitUntil:'networkidle'});
  await page.waitForTimeout(2500);
  const out = process.env.QA_SHOT || '/tmp/report.png';
  await page.screenshot({path: out, fullPage: false});
  const m = await page.evaluate(() => ({
    docW: document.documentElement.scrollWidth, innerW: window.innerWidth,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    ink: getComputedStyle(document.body).color,
    h1: (document.querySelector('h1')||{}).textContent,
    articles: document.querySelectorAll('article').length,
    rows: document.querySelectorAll('.summary tbody tr').length,
    wideOverflow: [...document.querySelectorAll('pre')].filter(p=>p.scrollWidth>p.clientWidth).length,
    preCount: document.querySelectorAll('pre').length
  }));
  return m;
}
