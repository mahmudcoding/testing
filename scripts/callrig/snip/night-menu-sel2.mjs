export default async ({page}) => page.evaluate(()=>{
  const menus=[...document.querySelectorAll('[role="menu"],[role="listbox"],[data-radix-popper-content-wrapper]')];
  const m=menus[menus.length-1]; if(!m) return {none:true};
  return [...m.querySelectorAll('button,[role="menuitem"],[role="menuitemradio"],[role="option"]')]
    .map(e=>({l:(e.textContent||'').trim().slice(0,26),
      pressed:e.getAttribute('aria-pressed'), sel:e.getAttribute('data-selected'),
      checked:e.getAttribute('aria-checked'), role:e.getAttribute('role'),
      fw:getComputedStyle(e).fontWeight, bg:getComputedStyle(e).backgroundColor}));
});
