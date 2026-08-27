export default async ({page}) => {
  const theme = process.env.QA_THEME || 'light';
  const out = {theme};
  await page.goto('http://127.0.0.1:8899/', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  await page.emulateMedia({colorScheme: theme});
  await page.evaluate((t)=>document.documentElement.setAttribute('data-theme',t), theme);
  await page.waitForTimeout(1200);
  out.metrics = await page.evaluate(()=>({
    bodyScrollW: document.body.scrollWidth, innerW: window.innerWidth,
    docScrollW: document.documentElement.scrollWidth,
    bg: getComputedStyle(document.body).backgroundColor,
    color: getComputedStyle(document.body).color,
    unresolved: [...document.querySelectorAll('*')].filter(e=>{
      const s=getComputedStyle(e); return s.color==='rgba(0, 0, 0, 0)' || s.backgroundColor==='rgba(0, 0, 0, 0)' && e.tagName==='ARTICLE';}).length,
    overflowing: [...document.querySelectorAll('pre,table,article,p,li')].filter(e=>e.scrollWidth>e.clientWidth+1)
      .map(e=>e.tagName.toLowerCase()+':'+e.scrollWidth+'>'+e.clientWidth).slice(0,8),
    articles: document.querySelectorAll('article').length,
    rows: document.querySelectorAll('.summary tbody tr').length,
    title: document.title
  }));
  await page.screenshot({path: process.env.QA_SHOT || '/tmp/preview.png', fullPage:false});
  return out;
};
