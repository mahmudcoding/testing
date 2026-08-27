export default async ({page}) => page.evaluate(()=>{
  const menus=[...document.querySelectorAll('[role="menu"],[role="listbox"],[data-radix-popper-content-wrapper]')];
  const m=menus[menus.length-1];
  if(!m) return {none:true};
  return {text:m.innerText.replace(/\n+/g,' | ').slice(0,300),
    items:[...m.querySelectorAll('[role="menuitem"],[role="option"],button')].map(e=>({
      l:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40),
      checked:e.getAttribute('aria-checked')||e.getAttribute('data-state')}))};
});
