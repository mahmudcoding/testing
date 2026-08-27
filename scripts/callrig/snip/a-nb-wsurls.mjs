export default async ({page}) => await page.evaluate(()=>{
  const l = window.__wsLog2 || [];
  const by = {};
  for (const x of l) { const k = x.url + '|' + x.dir; by[k] = (by[k]||0)+1; }
  return {urls: [...new Set(l.map(x=>x.url))], counts: by};
});
