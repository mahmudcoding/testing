export default async ({ browser }) => {
  const ctx = await browser.newContext({viewport:{width:1280,height:900}});
  const page = await ctx.newPage();
  const out={};
  try {
    await page.goto('http://127.0.0.1:8731/index.html', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(1800);
    out.fixed = await page.evaluate(() => {
      const ps=[...document.querySelectorAll('p')];
      const a=ps.find(p=>/механизм заведён и работает для соседних разделов/.test(p.innerText));
      const b=ps.find(p=>/ALK-3426/.test(p.innerText));
      const tail=s=>s? s.innerText.replace(/\s+/g,' ').slice(-150):'(not found)';
      return { finding3_tail: tail(a), finding12_snippet: b? b.innerText.replace(/\s+/g,' ').slice(120,300):'(not found)' };
    });
    out.layout = await page.evaluate(() => {
      const de=document.documentElement;
      const over=[...document.querySelectorAll('*')].filter(e=>{
        const r=e.getBoundingClientRect();
        return r.width>0 && r.right > innerWidth+1 && getComputedStyle(e).overflowX!=='auto';
      }).slice(0,5).map(e=>e.tagName.toLowerCase()+'.'+(e.className||'').toString().slice(0,24));
      return { bodyScrollW: de.scrollWidth, innerW: innerWidth,
        sidewaysScroll: de.scrollWidth>innerWidth, overflowing: over };
    });
    out.counts = await page.evaluate(()=>({articles:document.querySelectorAll('article').length,
      rows:document.querySelectorAll('table.summary tbody tr').length,
      pre:document.querySelectorAll('pre').length}));
  } finally { await ctx.close(); }
  return out;
};
