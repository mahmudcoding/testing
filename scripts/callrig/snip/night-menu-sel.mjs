export default async ({page}) => page.evaluate(()=>{
  const menus=[...document.querySelectorAll('[role="menu"],[role="listbox"],[data-radix-popper-content-wrapper]')];
  const m=menus[menus.length-1];
  if(!m) return {none:true};
  return [...m.querySelectorAll('button')].filter(b=>/Fake/.test(b.textContent||''))
    .map(e=>{const cs=getComputedStyle(e);
      return {l:(e.textContent||'').trim().replace(/Device ID.*/,'').slice(0,26),
        pressed:e.getAttribute('aria-pressed'), sel:e.getAttribute('data-selected'),
        color:cs.color, bg:cs.backgroundColor, fw:cs.fontWeight,
        border:cs.borderColor, outline:cs.outlineStyle};});
});
