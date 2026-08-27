export default async ({page}) => {
  const out={};
  for (const [n,u] of [['no token','/auth/verify-email'],
                       ['garbage token','/auth/verify-email?token=not-a-real-token-123'],
                       ['empty token','/auth/verify-email?token=']]) {
    const reqs=[]; const on=r=>{try{const x=new URL(r.url()); const m=r.request().method();
      if(m!=='GET'||x.pathname.startsWith('/api/')) reqs.push(`${m} ${x.pathname} -> ${r.status()}`);}catch{}};
    page.on('response', on);
    await page.goto('https://airion-cargo.store'+u,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6000);
    page.off('response', on);
    const s = await page.evaluate(()=>{
      const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
      return {url:location.pathname+location.search,
        heads:[...document.querySelectorAll('h1,h2,h3')].filter(vis).map(h=>h.innerText.trim().slice(0,60)),
        ctrls:[...document.querySelectorAll('button,a')].filter(vis)
          .map(b=>`${b.tagName.toLowerCase()}${b.disabled?'(dis)':''}: ${((b.getAttribute('aria-label')||b.innerText)||'').replace(/\s+/g,' ').trim().slice(0,38)}`),
        txt:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,420)};
    });
    out[n]={reqs, ...s};
  }
  return out;
};
