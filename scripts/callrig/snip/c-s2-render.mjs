export default async ({page}) => {
  await page.goto('http://127.0.0.1:8944/index.html');
  await page.waitForTimeout(5000);
  return page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const arts=[...document.querySelectorAll('article')];
    const a=arts[0];
    const cs=a?getComputedStyle(a):null;
    const table=document.querySelector('table.summary');
    const pres=[...document.querySelectorAll('pre')];
    const overflow=pres.filter(p=>p.scrollWidth>p.clientWidth+2).length;
    const bodyOverflow=document.documentElement.scrollWidth>document.documentElement.clientWidth+2;
    return {
      articlesRendered:arts.length,
      articlesVisible:arts.filter(v).length,
      firstArticleStyled: cs? {bg:cs.backgroundColor, pad:cs.padding, radius:cs.borderRadius}:null,
      tableRows: table?table.querySelectorAll('tbody tr').length:0,
      tableVisible: table?v(table):false,
      preBlocks:pres.length, preHorizontallyScrollable:overflow,
      bodyScrollsSideways:bodyOverflow,
      h1:(document.querySelector('h1')||{}).innerText,
      pageHeight:Math.round(document.documentElement.scrollHeight),
      fontFamily:getComputedStyle(document.body).fontFamily.slice(0,44)};
  });
};
