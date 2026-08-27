// Walk the auth routes and record heads/controls/copy for each.
export default async ({page}) => {
  const routes = (process.env.QA_ROUTES||'').split(';').filter(Boolean);
  const out={};
  for (const r of routes) {
    const reqs=[]; const on=x=>{try{const u=new URL(x.url()); const m=x.request().method();
      if(m!=='GET'||u.pathname.startsWith('/api/')) reqs.push(`${m} ${u.pathname} -> ${x.status()}`);}catch{}};
    page.on('response', on);
    await page.goto('https://airion-cargo.store'+r,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(5500);
    page.off('response', on);
    out[r] = await page.evaluate(()=>{
      const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
      const lab=e=>{ if(e.id){const l=document.querySelector(`label[for="${CSS.escape(e.id)}"]`); if(l)return l.innerText.trim();}
        const l=e.closest('label'); if(l)return l.innerText.trim(); return ''; };
      return {url:location.pathname+location.search,
        heads:[...document.querySelectorAll('h1,h2,h3')].filter(vis).map(h=>h.innerText.trim().slice(0,60)),
        fields:[...document.querySelectorAll('input')].filter(vis).map(e=>`${e.type}${e.required?'*':''}:${lab(e)||e.placeholder||e.name}`),
        ctrls:[...document.querySelectorAll('button,a')].filter(vis)
          .map(b=>`${b.tagName.toLowerCase()}${b.disabled?'(dis)':''}: ${((b.getAttribute('aria-label')||b.innerText)||'').replace(/\s+/g,' ').trim().slice(0,40)}`),
        txt:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,450)};
    });
    out[r].reqs = reqs;
  }
  return out;
};
