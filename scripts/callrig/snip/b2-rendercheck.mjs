export default async ({ page }) => {
  return await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const arts = [...document.querySelectorAll('article')];
    const overflow = [...document.querySelectorAll('body *')].filter(e => {
      const s = getComputedStyle(e);
      return e.scrollWidth > e.clientWidth + 2 && s.overflowX !== 'auto' && s.overflowX !== 'scroll'
             && e.children.length === 0; });
    return {
      title: document.title,
      articles: arts.length,
      allArticlesVisible: arts.every(v),
      h2Count: document.querySelectorAll('h2').length,
      tableRows: document.querySelectorAll('table.summary tbody tr').length,
      bodyScrollsSideways: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      bodyBg: getComputedStyle(document.body).backgroundColor,
      bodyColor: getComputedStyle(document.body).color,
      preBlocks: document.querySelectorAll('pre').length,
      preOverflowAuto: [...document.querySelectorAll('pre')].every(p => getComputedStyle(p).overflowX === 'auto'),
      clippedLeafNodes: overflow.length,
      firstClipped: overflow.slice(0,3).map(e => (e.innerText||'').slice(0,40))
    };
  });
};
