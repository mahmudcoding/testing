// Create an invite link WITH a role and return its token.
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/invites`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const out={};
  const trig = page.locator('main button[aria-label="Role"]').first();
  await trig.scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
  await trig.click(); await page.waitForTimeout(1600);
  out.picked = await page.evaluate(want=>{
    const vis=el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2;};
    const pop=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=listbox],[role=menu]')].filter(vis).pop();
    if(!pop) return {err:'no popup'};
    const items=[...pop.querySelectorAll('*')].filter(e=>e.children.length===0 && (e.textContent||'').trim());
    const hit=items.find(e=>(e.textContent||'').trim()===want);
    if(!hit) return {err:'not found', have:[...new Set(items.map(e=>e.textContent.trim()))].slice(0,8)};
    let c=hit; for(let i=0;i<4&&c;i++,c=c.parentElement){if(c.getAttribute&&(c.getAttribute('role')||/^(BUTTON|LI|A)$/.test(c.tagName)))break;}
    (c||hit).click(); return {ok:want};
  }, process.env.QA_ROLEOPT || 'Member · Workspace role');
  await page.waitForTimeout(1200);
  const reqs=[]; const bodies=[];
  const on=async r=>{try{const u=new URL(r.url()); if(u.pathname.startsWith('/api/v1/')){reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);
    if(/invites$/.test(u.pathname)&&r.request().method()==='POST'){ bodies.push((await r.text()).slice(0,300)); }}}catch{}};
  page.on('response', on);
  const btn = page.locator('main button').filter({hasText:/^Create invite link$/}).first();
  await btn.scrollIntoViewIfNeeded();
  out.btnDisabled = await btn.isDisabled();
  if(!out.btnDisabled) await btn.click();
  await page.waitForTimeout(5500);
  out.reqs=reqs.filter(r=>/invite/i.test(r)); out.bodies=bodies; page.off('response', on);
  out.card = await page.evaluate(()=>{
    const m=document.querySelector('main');
    const c=m.querySelector('[data-testid="admin-invite-created-card"]');
    return c?{txt:(c.innerText||'').replace(/\s+/g,' ').slice(0,260)}:null;});
  return out;
};
