export default async ({ browser }) => {
  const ctx = await browser.newContext({viewport:{width:1280,height:900}});
  const page = await ctx.newPage();
  const out={};
  try {
    await page.goto('file:///private/tmp/claude-501/-Users-mahmud-Projects-testing/1beb7afd-5a20-4aa5-8da9-4c3da4a06af7/scratchpad/render/index.html',
      {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(1500);
    out.structure = await page.evaluate(()=>({
      articles: document.querySelectorAll('article').length,
      rows: document.querySelectorAll('table.summary tbody tr').length,
      pre: document.querySelectorAll('pre').length,
      h2: document.querySelectorAll('h2').length }));
    out.layout = await page.evaluate(()=>{
      const de=document.documentElement;
      const over=[...document.querySelectorAll('*')].filter(e=>{
        const r=e.getBoundingClientRect();
        return r.width>0 && r.right>innerWidth+1 && getComputedStyle(e).overflowX!=='auto';
      }).slice(0,4).map(e=>e.tagName.toLowerCase());
      return { scrollW:de.scrollWidth, innerW:innerWidth, sideways:de.scrollWidth>innerWidth, overflowing:over };
    });
    out.finding3 = await page.evaluate(()=>{
      const a=[...document.querySelectorAll('article')].find(x=>/Право создавать роли/.test(x.innerText));
      const t=(a?.innerText||'').replace(/\s+/g,' ');
      return { hasWorkspaceCase:/То же самое на слое workspace/.test(t),
               hasWsVerification:/Manage workspace roles and assign them to members/.test(t),
               hasWsExpected:/То же для пары workspace-прав/.test(t) };
    });
  } finally { await ctx.close(); }
  return out;
};
