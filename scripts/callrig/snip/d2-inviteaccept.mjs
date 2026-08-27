// Find the pending workspace invite in the UI and accept it.
export default async ({page}) => {
  const out={};
  await page.goto('https://airion-cargo.store/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.landed = page.url();
  // open Notifications
  const menu = page.locator('button[aria-label*="Pending workspace invites"]').first();
  out.menuFound = await menu.count();
  if (out.menuFound) { await menu.click(); await page.waitForTimeout(3000); }
  out.panel = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    const p=[...document.querySelectorAll('[role=dialog],[role=menu],[data-radix-popper-content-wrapper],aside,section')].filter(vis)
      .filter(e=>/invit/i.test(e.innerText||''));
    return p.slice(0,2).map(x=>({txt:(x.innerText||'').replace(/\s+/g,' ').slice(0,400),
      btns:[...x.querySelectorAll('button,a')].filter(vis).map(b=>((b.getAttribute('aria-label')||b.innerText)||'').trim()).filter(Boolean).slice(0,12)}));
  });
  // any Accept/Join control anywhere visible
  out.acceptControls = await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    return [...document.querySelectorAll('button,a')].filter(vis)
      .map(e=>((e.getAttribute('aria-label')||e.innerText)||'').replace(/\s+/g,' ').trim())
      .filter(t=>/accept|join|decline|invit/i.test(t)).slice(0,10);
  });
  if (process.env.QA_GO==='1') {
    const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(u.pathname.startsWith('/api/v1/')) reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{}};
    page.on('response', on);
    const acc = page.locator('button,a').filter({hasText:/^(Accept|Join|Accept invitation|Join workspace)$/i}).first();
    out.accFound = await acc.count();
    if (out.accFound) { await acc.scrollIntoViewIfNeeded(); await acc.click(); await page.waitForTimeout(6000); }
    out.reqs=reqs.filter(r=>/invite|workspace/i.test(r)); page.off('response', on);
    out.afterUrl = page.url();
    out.afterTxt = await page.evaluate(()=>(document.body.innerText||'').replace(/\s+/g,' ').slice(0,320));
  }
  return out;
};
