import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const rx = new RegExp(process.env.QA_RX || 'pinned', 'i');
  return await page.evaluate(([r,v])=>{ const vis=eval(v); const re=new RegExp(r,'i');
    const hits=[];
    for (const e of document.querySelectorAll('*')) {
      const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(' ').trim();
      const al=e.getAttribute && e.getAttribute('aria-label');
      const ttl=e.getAttribute && e.getAttribute('title');
      for (const [src,val] of [['text',own],['aria-label',al],['title',ttl]]) {
        if (val && re.test(val)) {
          const rect=e.getBoundingClientRect();
          hits.push({src, val:val.slice(0,90), tag:e.tagName.toLowerCase(),
            tid:e.getAttribute('data-testid'), visible:vis(e),
            w:Math.round(rect.width), h:Math.round(rect.height)});
        }
      }
    }
    return hits.slice(0,12); }, [rx.source, VIS]);
}
