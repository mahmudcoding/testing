export default async ({ browser }) => {
  const ctx = await browser.newContext({viewport:{width:1280,height:900}});
  const page = await ctx.newPage(); const out={};
  try {
    await page.goto('file:///private/tmp/claude-501/-Users-mahmud-Projects-testing/1beb7afd-5a20-4aa5-8da9-4c3da4a06af7/scratchpad/render/index.html',{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(1500);
    out.structure = await page.evaluate(()=>({articles:document.querySelectorAll('article').length,
      rows:document.querySelectorAll('table.summary tbody tr').length, pre:document.querySelectorAll('pre').length}));
    out.layout = await page.evaluate(()=>({sideways:document.documentElement.scrollWidth>innerWidth,
      overflowing:[...document.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();
        return r.width>0&&r.right>innerWidth+1&&getComputedStyle(e).overflowX!=='auto';}).length}));
    out.newText = await page.evaluate(()=>{
      const a=[...document.querySelectorAll('article')].find(x=>/Сообщение об ошибке в/.test(x.innerText));
      const t=(a?.innerText||'').replace(/\s+/g,' ');
      return { hasRussianMsg:/Нельзя отключить уведомления в приложении/.test(t),
               hasAllLocales:/все четыре локали/.test(t),
               mojibake:/[ÐÑÂ]{2,}|�/.test(t) };
    });
    out.finding3ws = await page.evaluate(()=>{
      const a=[...document.querySelectorAll('article')].find(x=>/Право создавать роли/.test(x.innerText));
      return /То же самое на слое workspace/.test(a?.innerText||'');
    });
  } finally { await ctx.close(); }
  return out;
};
