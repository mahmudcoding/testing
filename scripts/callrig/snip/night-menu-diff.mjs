export default async ({page}) => page.evaluate(()=>{
  const menus=[...document.querySelectorAll('[role="menu"],[role="listbox"],[data-radix-popper-content-wrapper]')];
  const m=menus[menus.length-1];
  if(!m) return {none:true};
  const items=[...m.querySelectorAll('button')].filter(b=>/Fake/.test(b.textContent||''));
  const cls=items.map(e=>e.className.toString());
  const base=cls[0]||'';
  return {n:items.length,
    labels: items.map(e=>(e.textContent||'').trim().replace(/Device ID.*/,'').slice(0,28)),
    classDiffs: cls.map(c=>{
      const a=new Set(base.split(/\s+/)), b=c.split(/\s+/);
      const extra=b.filter(x=>!a.has(x)); const missing=[...a].filter(x=>!b.includes(x));
      return {extra, missing};}),
    innerTextEq: items.map(e=>({txt:(e.textContent||'').trim().slice(0,40),
      hasIcon:e.querySelectorAll('svg,img').length,
      dataAttrs:[...e.attributes].map(a=>a.name).filter(n=>/^data-|^aria-/.test(n))}))};
});
