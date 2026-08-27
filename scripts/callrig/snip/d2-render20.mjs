export default async ({ browser }) => {
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage(); const out={};
  try {
    await page.goto('file:///private/tmp/claude-501/-Users-mahmud-Projects-testing/1beb7afd-5a20-4aa5-8da9-4c3da4a06af7/scratchpad/render/index.html',{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(1500);
    out.structure=await page.evaluate(()=>({articles:document.querySelectorAll('article').length,
      rows:document.querySelectorAll('table.summary tbody tr').length, pre:document.querySelectorAll('pre').length}));
    out.layout=await page.evaluate(()=>({sideways:document.documentElement.scrollWidth>innerWidth,
      overflow:[...document.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();
        return r.width>0&&r.right>innerWidth+1&&getComputedStyle(e).overflowX!=='auto';}).length}));
    out.newArticle=await page.evaluate(()=>{
      const a=[...document.querySelectorAll('article')].find(x=>/M08/.test(x.innerText));
      if(!a) return {found:false};
      const t=(a.innerText||'').replace(/\s+/g,' ');
      return { found:true, hasIntl:/Intl.DateTimeFormat/.test(t), hasFourLocales:/Uzbek \(Cyrillic\)/.test(t),
        hasCause:/данных ICU/.test(t), mojibake:/[ÐÑÂ]{2,}|�/.test(t), len:t.length };
    });
    out.lastRow=await page.evaluate(()=>{
      const rows=[...document.querySelectorAll('table.summary tbody tr')];
      return (rows[rows.length-1]?.innerText||'').replace(/\s+/g,' ').slice(0,90);
    });
  } finally { await ctx.close(); }
  return out;
};
