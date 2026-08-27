// Toggle a labelled switch on a settings page and save if a save bar appears.
// QA_PAGE (e.g. privacy), QA_LABEL substring, QA_WANT = on|off
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/${process.env.QA_PAGE}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const want = process.env.QA_WANT==='on', want_s = process.env.QA_LABEL;
  const list = () => page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const lab=e=>{ if(e.id){const l=document.querySelector(`label[for="${CSS.escape(e.id)}"]`); if(l)return l.innerText.trim();}
      const l=e.closest('label'); if(l)return l.innerText.trim();
      let p=e.parentElement; for(let k=0;k<5&&p;k++,p=p.parentElement){const t=(p.innerText||'').trim(); if(t&&t.length<140)return t;} return ''; };
    return [...document.querySelectorAll('[role=switch],input[type=checkbox]')].filter(vis).map((e,i)=>({i,
      role:e.getAttribute('role')||e.type,
      on: e.getAttribute('aria-checked')==='true' || e.checked===true,
      dis: e.disabled===true||e.getAttribute('aria-disabled')==='true',
      label: lab(e).replace(/\s+/g,' ').slice(0,80)}));
  });
  const before = await list();
  const idx = before.findIndex(s=>s.label.toLowerCase().includes(want_s.toLowerCase()));
  if (idx<0) return {err:'switch not found', before};
  const out={before: before[idx], allSwitches: before.map(s=>`${s.on?'ON ':'off'}${s.dis?'(dis)':''} ${s.label.slice(0,50)}`)};
  if (before[idx].on===want) { out.note='already in wanted state'; return out; }

  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(u.pathname.startsWith('/api/v1/')) reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  const el = page.locator('[role=switch],input[type=checkbox]').nth(idx);
  await el.scrollIntoViewIfNeeded(); await el.click();
  await page.waitForTimeout(1500);
  out.afterClick = (await list())[idx];
  // a save bar may now exist (form goes dirty)
  const save = page.locator('main button').filter({hasText:/^(Save preferences|Save changes|Save)$/});
  out.saveButtons = await save.count();
  if (out.saveButtons) { await save.last().scrollIntoViewIfNeeded(); await save.last().click(); await page.waitForTimeout(3500); }
  else await page.waitForTimeout(2500);
  out.reqs = reqs.slice(); page.off('response', on);
  out.afterSave = (await list())[idx];
  return out;
};
