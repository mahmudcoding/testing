export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/notifications',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); if(r.width<2||r.height<2) return false;
      let n=el,o=1; while(n&&n!==document.documentElement){const c=getComputedStyle(n);
        if(c.display==='none'||c.visibility==='hidden')return false; o*=parseFloat(c.opacity||'1'); n=n.parentElement;} return o>0.01;};
    const m=document.querySelector('main');
    const lab=e=>{ if(e.id){const l=document.querySelector(`label[for="${CSS.escape(e.id)}"]`); if(l)return l.innerText.trim();}
      const l=e.closest('label'); if(l)return l.innerText.trim();
      let p=e.parentElement; for(let k=0;k<5&&p;k++,p=p.parentElement){const t=(p.innerText||'').trim(); if(t&&t.length<150)return t;} return ''; };
    return {heads:[...m.querySelectorAll('h1,h2,h3,h4')].filter(vis).map(h=>h.innerText.replace(/\s+/g,' ').trim().slice(0,60)),
      controls:[...m.querySelectorAll('[role=switch],button[role=combobox],input,select,button')].filter(vis)
        .filter(e=>!/Filter settings/.test(e.placeholder||''))
        .map(e=>{const r=e.getBoundingClientRect(); return {y:Math.round(r.top),
          kind:e.getAttribute('role')||e.tagName.toLowerCase()+(e.type?'['+e.type+']':''),
          on:e.getAttribute('aria-checked')||(e.type==='checkbox'?String(e.checked):''),
          dis:e.disabled===true||e.getAttribute('aria-disabled')==='true',
          val:String(e.value||'').slice(0,20),
          txt:((e.getAttribute('aria-label')||e.innerText)||'').replace(/\s+/g,' ').trim().slice(0,34),
          label:lab(e).replace(/\s+/g,' ').slice(0,62)};}).sort((a,b)=>a.y-b.y),
      txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,1600)};
  });
};
