// Send a direct workspace invite to a named company member, via the UI.
export default async ({page}) => {
  const who = process.env.QA_WHO || 'QA Outsider';
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/invites',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const out={};
  // tick the recipient checkbox whose own label names the person
  out.ticked = await page.evaluate((who)=>{
    const lab=b=>{ if(b.id){const l=document.querySelector(`label[for="${CSS.escape(b.id)}"]`); if(l)return l.innerText.trim();}
      const l=b.closest('label'); if(l)return l.innerText.trim();
      let p=b.parentElement; for(let k=0;k<4&&p;k++,p=p.parentElement){const t=(p.innerText||'').trim(); if(t&&t.length<120)return t;} return ''; };
    for (const b of document.querySelectorAll('input[type=checkbox]')) {
      const L=lab(b);
      if (L.includes(who)) { b.scrollIntoView({block:'center'}); b.click(); return {label:L.slice(0,60), checked:b.checked}; }
    }
    return null;
  }, who);
  await page.waitForTimeout(800);
  // QA_ROLEBOX: label substring of a role checkbox to tick instead of "Invite without a role"
  const want = process.env.QA_ROLEBOX || 'Invite without a role';
  out.noRole = await page.evaluate((want)=>{
    const lab=b=>{ if(b.id){const l=document.querySelector(`label[for="${CSS.escape(b.id)}"]`); if(l)return l.innerText.trim();}
      const l=b.closest('label'); if(l)return l.innerText.trim(); return ''; };
    for (const b of document.querySelectorAll('input[type=checkbox]')) {
      if (lab(b).toLowerCase().includes(want.toLowerCase())) { if(!b.checked){b.click();} return {label:lab(b).slice(0,50), checked:b.checked}; }
    } return null;
  }, want);
  await page.waitForTimeout(800);
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(u.pathname.startsWith('/api/v1/')) reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  const sub = page.locator('main button').filter({hasText:/^Send direct invites$/}).first();
  await sub.scrollIntoViewIfNeeded();
  out.submitDisabled = await sub.isDisabled();
  if (!out.submitDisabled) await sub.click();
  await page.waitForTimeout(5000);
  out.reqs = reqs.filter(r=>/invite/i.test(r)); page.off('response', on);
  out.notices = await page.evaluate(()=>[...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')]
    .filter(e=>{const r=e.getBoundingClientRect(); return r.width>2&&r.height>2;})
    .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,4));
  const t = await page.evaluate(()=>(document.querySelector('main').innerText||'').replace(/\s+/g,' '));
  out.directList = t.slice(t.indexOf('Direct invites'), t.indexOf('Direct invites')+500);
  return out;
};
