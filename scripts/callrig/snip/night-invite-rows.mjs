export default async ({page}) => page.evaluate(()=>{
  const ms=[...document.querySelectorAll('[role="dialog"]')];
  const m=ms[ms.length-1]; if(!m) return {none:true};
  const els=[...m.querySelectorAll('button,[role="option"],[role="checkbox"],label,li')]
    .filter(e=>/QA (Admin|Alice|Bob|Carol|Dave|Guest|Owner)/.test(e.textContent||''));
  return {rows: els.map(e=>({tag:e.tagName.toLowerCase(), role:e.getAttribute('role'),
    txt:(e.textContent||'').replace(/\s+/g,' ').trim().slice(0,36),
    disabled: e.disabled===true || e.getAttribute('aria-disabled')==='true',
    checked: e.getAttribute('aria-checked')||e.getAttribute('data-state'),
    kids:e.children.length})).slice(0,12)};
});
