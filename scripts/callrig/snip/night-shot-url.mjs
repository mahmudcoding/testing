export default async ({page}) => {
  await page.goto(process.env.QA_URL,{waitUntil:'networkidle'});
  await page.waitForTimeout(2500);
  await page.screenshot({path: process.env.QA_SHOT, fullPage: false});
  const m = await page.evaluate(()=>({
    title: document.title,
    bodyBg: getComputedStyle(document.body).backgroundColor,
    bodyColor: getComputedStyle(document.body).color,
    h1: (document.querySelector('h1')||{}).textContent,
    articles: document.querySelectorAll('article').length,
    hOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    fonts: getComputedStyle(document.querySelector('h1')).fontFamily.slice(0,40)
  }));
  return m;
};
