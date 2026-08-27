export default async ({page}) => {
  return await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const get=n=>[...document.querySelectorAll('a[aria-label]')].filter(vis).find(e=>e.getAttribute('aria-label')===n);
    const g=get('qa-general'), p=get('qa-private');
    const desc=el=>{ if(!el) return null; const cs=getComputedStyle(el);
      const span=el.querySelector('span'); const ss=span?getComputedStyle(span):null;
      return {fw:cs.fontWeight, color:cs.color, spanFw:ss?ss.fontWeight:null, spanColor:ss?ss.color:null,
        childCount:el.children.length,
        childTags:[...el.children].map(c=>c.tagName+'.'+(c.className||'').toString().split(' ')[0]).slice(0,6),
        cls:(el.className||'').toString()};
    };
    return {general:desc(g), private:desc(p)};
  });
};
