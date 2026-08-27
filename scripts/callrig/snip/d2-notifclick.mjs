export default async ({page}) => {
  await page.goto('https://airion-cargo.store/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const out={before:page.url()};
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button,a')]
    .filter(e=>{const r=e.getBoundingClientRect();return r.width>2&&r.height>2;})
    .find(e=>/notifications,/i.test(e.getAttribute('aria-label')||'')); if(b)b.click();});
  await page.waitForTimeout(3000);
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(u.pathname.startsWith('/api/v1/')) reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  out.clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button,a')]
      .filter(e=>{const r=e.getBoundingClientRect();return r.width>2&&r.height>2;})
      .find(e=>/Workspace invitation/i.test((e.getAttribute('aria-label')||e.innerText||'')));
    if(!b) return null; b.click(); return (b.getAttribute('aria-label')||b.innerText).slice(0,60);
  });
  await page.waitForTimeout(6000);
  out.reqs=reqs.slice(); page.off('response', on);
  out.after = page.url();
  out.screen = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    return {txt:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,420),
      actions:[...document.querySelectorAll('button,a,[role=button]')].filter(vis)
        .map(e=>((e.getAttribute('aria-label')||e.innerText)||'').replace(/\s+/g,' ').trim())
        .filter(t=>/accept|decline|join|invit/i.test(t)).slice(0,10)};
  });
  return out;
};
