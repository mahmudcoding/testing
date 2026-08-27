// Which controls does the Visibility disclaimer actually sit above/inside?
export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/privacy',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(()=>{
    const NOTE='do not change what others can see';
    const all=[...document.querySelectorAll('*')];
    const note=all.filter(e=>e.children.length===0 && (e.textContent||'').includes(NOTE))[0];
    if(!note) return {err:'note not found'};
    const nb=note.getBoundingClientRect();
    // walk up to the section that owns the note
    let sec=note; while(sec && !/SECTION|ARTICLE|FIELDSET|DIV/.test(sec.tagName)) sec=sec.parentElement;
    // the nearest ancestor that contains at least one switch
    let owner=note; while(owner && owner.querySelectorAll('[role=switch]').length===0 && owner!==document.body) owner=owner.parentElement;
    const lab=e=>{ if(e.id){const l=document.querySelector(`label[for="${CSS.escape(e.id)}"]`); if(l)return l.innerText.trim();}
      const l=e.closest('label'); if(l)return l.innerText.trim();
      let p=e.parentElement; for(let k=0;k<5&&p;k++,p=p.parentElement){const t=(p.innerText||'').trim(); if(t&&t.length<140)return t;} return ''; };
    const ctl=[...document.querySelectorAll('[role=switch],button[role=combobox],select')].map(e=>{
      const r=e.getBoundingClientRect();
      return {label: lab(e).replace(/\s+/g,' ').slice(0,60), y: Math.round(r.top),
              belowNote: r.top > nb.top, inNoteOwner: owner.contains(e)};
    });
    // the Visibility heading and the next heading, to bound the section visually
    const heads=[...document.querySelectorAll('h1,h2,h3,h4')].map(h=>({t:h.innerText.trim().slice(0,40), y:Math.round(h.getBoundingClientRect().top)}));
    return {noteY: Math.round(nb.top), noteOwnerTag: owner.tagName.toLowerCase(),
            noteOwnerSwitches: owner.querySelectorAll('[role=switch]').length,
            noteOwnerCombos: owner.querySelectorAll('button[role=combobox]').length,
            headings: heads, controls: ctl};
  });
};
