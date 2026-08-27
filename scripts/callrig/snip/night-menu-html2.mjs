export default async ({page}) => page.evaluate(()=>{
  const menus=[...document.querySelectorAll('[role="menu"],[role="listbox"],[data-radix-popper-content-wrapper]')];
  const m=menus[menus.length-1];
  if(!m) return {none:true};
  const items=[...m.querySelectorAll('button')];
  const norm=(h)=>h.replace(/\s+/g,' ').replace(/Device ID [^<]*/g,'DEVID');
  return {count:items.length,
    sample: items.slice(0,3).map(e=>norm(e.outerHTML).slice(0,260)),
    distinctClasses:[...new Set(items.map(e=>e.className.toString().slice(0,70)))].slice(0,5),
    menuRole: m.getAttribute('role')};
});
