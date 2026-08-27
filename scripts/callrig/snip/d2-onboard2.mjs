import { safeClick } from './lib.mjs';
export default async ({page}) => {
  await page.goto('https://airion-cargo.store/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const out={landed:page.url()};
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); const m=r.request().method();
    if(m!=='GET'||u.pathname.startsWith('/api/v1/')) reqs.push(`${m} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  out.click = await safeClick(page,'main button:has-text("Create a company")');
  await page.waitForTimeout(5000);
  out.reqs=reqs.slice(); page.off('response', on);
  out.url = page.url();
  out.state = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2;};
    const d=document.querySelector('[role=dialog],[role=alertdialog]');
    const root=d||document.querySelector('main')||document.body;
    const lab=e=>{ if(e.id){const l=document.querySelector(`label[for="${CSS.escape(e.id)}"]`); if(l)return l.innerText.trim();}
      const l=e.closest('label'); if(l)return l.innerText.trim();
      let p=e.parentElement; for(let k=0;k<4&&p;k++,p=p.parentElement){const t=(p.innerText||'').trim(); if(t&&t.length<120)return t;} return ''; };
    return {isDialog:!!d,
      heads:[...root.querySelectorAll('h1,h2,h3')].filter(vis).map(h=>h.innerText.trim().slice(0,50)),
      fields:[...root.querySelectorAll('input,textarea,select')].filter(vis)
        .filter(e=>!/Filter settings|Search/.test(e.placeholder||''))
        .map(e=>`${e.type}${e.required?'*':''} max=${e.getAttribute('maxlength')||'-'} ph="${e.placeholder||''}" lbl="${lab(e).slice(0,32)}"`),
      btns:[...root.querySelectorAll('button')].filter(vis).map(b=>`${b.disabled?'(dis)':''}${(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,26)}`),
      txt:(root.innerText||'').replace(/\s+/g,' ').slice(0,500)};
  });
  return out;
};
