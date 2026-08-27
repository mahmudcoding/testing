export default async ({page}) => page.evaluate(()=>{
  const menus=[...document.querySelectorAll('[role="menu"],[role="listbox"],[data-radix-popper-content-wrapper]')];
  const m=menus[menus.length-1];
  if(!m) return {none:true};
  return {items:[...m.querySelectorAll('[role="menuitem"],[role="option"],button')].map(e=>({
    l:(e.textContent||'').trim().slice(0,34),
    ariaChecked:e.getAttribute('aria-checked'), ariaSelected:e.getAttribute('aria-selected'),
    dataState:e.getAttribute('data-state'),
    svgs:e.querySelectorAll('svg').length,
    bg:getComputedStyle(e).backgroundColor,
    fw:getComputedStyle(e).fontWeight}))};
});
