export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/privacy',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  return await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const m=document.querySelector('main');
    const txt=(m.innerText||'').replace(/\s+/g,' ');
    const i=txt.indexOf('Messaging & invitations'), j=txt.indexOf('Encryption');
    const lab=e=>{ if(e.id){const l=document.querySelector(`label[for="${CSS.escape(e.id)}"]`); if(l)return l.innerText.trim();}
      const l=e.closest('label'); if(l)return l.innerText.trim();
      let p=e.parentElement; for(let k=0;k<5&&p;k++,p=p.parentElement){const t=(p.innerText||'').trim(); if(t&&t.length<150)return t;} return ''; };
    const ctl=[...m.querySelectorAll('[role=switch],button[role=combobox],button,input')].filter(vis)
      .filter(e=>!/Filter settings/.test(e.placeholder||''))
      .map(e=>{const r=e.getBoundingClientRect(); return {y:Math.round(r.top),
        kind:e.getAttribute('role')||e.tagName.toLowerCase()+(e.type?'['+e.type+']':''),
        on:e.getAttribute('aria-checked'), dis:e.disabled===true||e.getAttribute('aria-disabled')==='true',
        txt:((e.getAttribute('aria-label')||e.innerText)||'').replace(/\s+/g,' ').trim().slice(0,38),
        label:lab(e).replace(/\s+/g,' ').slice(0,70)};});
    return {section: txt.slice(i, j>i?j:i+700), controls: ctl};
  });
};
