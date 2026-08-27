// Label every control on the Invites page by walking to its own label/legend.
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/invites`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(()=>{
    const vis=el=>{const b=el.getBoundingClientRect(); return b.width>0&&b.height>0;};
    const m=document.querySelector('main');
    const lab=e=>{
      if(e.id){const l=document.querySelector(`label[for="${CSS.escape(e.id)}"]`); if(l) return l.innerText.trim();}
      const l=e.closest('label'); if(l) return l.innerText.trim();
      let p=e.parentElement; for(let k=0;k<4&&p;k++,p=p.parentElement){const t=(p.innerText||'').trim(); if(t&&t.length<130) return t;}
      return '';
    };
    return [...m.querySelectorAll('button,input,select,[role=combobox],[role=switch]')].filter(vis)
      .filter(e=>!/Filter settings/.test(e.placeholder||''))
      .map(e=>({tag:e.tagName.toLowerCase()+(e.type?'['+e.type+']':''),
                disabled: e.disabled===true||e.getAttribute('aria-disabled')==='true',
                aria:(e.getAttribute('aria-label')||'').slice(0,40),
                own:(e.innerText||e.placeholder||'').replace(/\s+/g,' ').trim().slice(0,40),
                label: lab(e).replace(/\s+/g,' ').slice(0,110)}));
  });
};
