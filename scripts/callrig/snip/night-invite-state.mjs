export default async ({page}) => page.evaluate(()=>{
  const ms=[...document.querySelectorAll('[role="dialog"]')];
  const m=ms[ms.length-1]; if(!m) return {none:true};
  const rows=[...m.querySelectorAll('label')].filter(e=>/QA /.test(e.textContent||''));
  return {rows: rows.map(e=>{
      const inp=e.querySelector('input,[role="checkbox"],button');
      return {txt:(e.textContent||'').replace(/\s+/g,' ').trim().slice(0,34),
        inputTag: inp?inp.tagName.toLowerCase():null,
        disabled: inp?(inp.disabled===true||inp.getAttribute('aria-disabled')==='true'):null,
        checked: inp?(inp.checked===true||inp.getAttribute('aria-checked')==='true'):null};
    }),
    inviteBtn:(()=>{const b=[...m.querySelectorAll('button')].find(x=>/^Invite \(/.test((x.textContent||'').trim()));
      return b?{label:(b.textContent||'').trim(), disabled:b.disabled}:null;})()};
});
