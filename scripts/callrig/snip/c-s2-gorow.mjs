export default async ({page}) => page.evaluate(()=>{
  let best=null;
  for (const el of document.querySelectorAll('main *')){
    const t=el.innerText||'';
    if(!/THREAD REPLY/.test(t)||!/Go to message/.test(t)) continue;
    const a=el.getBoundingClientRect().width*el.getBoundingClientRect().height;
    if(!best||a<best.a) best={el,a};
  }
  if(!best) return 'no row';
  const el=best.el;
  const inter=[...el.querySelectorAll('*')].filter(e=>{
    const r=e.getBoundingClientRect(); if(r.width<2||r.height<2) return false;
    return e.tagName==='BUTTON'||e.tagName==='A'||e.getAttribute('role')==='button'
      || e.hasAttribute('tabindex') || getComputedStyle(e).cursor==='pointer';
  }).map(e=>({tag:e.tagName, role:e.getAttribute('role'), href:e.getAttribute('href'),
      tabindex:e.getAttribute('tabindex'), cursor:getComputedStyle(e).cursor,
      txt:(e.innerText||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,26)}));
  const self={tag:el.tagName, role:el.getAttribute('role'), cursor:getComputedStyle(el).cursor,
    href:el.getAttribute('href')};
  return {rowText:el.innerText.replace(/\s+/g,' ').slice(0,90), self, interactive:inter.slice(0,12)};
});
