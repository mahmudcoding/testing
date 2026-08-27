// Capture settings pages in English, switch to Uzbek, capture again, and report
// sentences that are byte-identical in both (i.e. never translated).
// Always restores English at the end.
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const PAGES=['settings/account','settings/privacy','settings/security','settings/sessions',
               'settings/notifications','settings/about','settings/company','settings/roles',
               'settings/admin/members','settings/admin/invites'];
  const TARGET = process.env.QA_TARGET_LANG || 'Uzbek';
  const grab = async p => { await page.goto(`https://airion-cargo.store/w/${WS}/${p}`,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3600);
    return await page.evaluate(()=>{const m=document.querySelector('main')||document.body;
      return (m.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean);});
  };
  const setLang = async want => {
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4500);
    // the trigger is button[aria-label="Language"] and sits below the fold;
    // its menu items are NOT role=option — click them inside the popper by text.
    const trig = page.locator('main button[aria-label="Language"]').first();
    if(!(await trig.count())) return {err:'no language trigger'};
    await trig.scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
    const was = (await trig.innerText()).trim();
    await trig.click(); await page.waitForTimeout(1800);
    const picked = await page.evaluate(w=>{
      const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
      const pop=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=listbox],[role=menu]')].filter(vis).pop();
      if(!pop) return {err:'no popup'};
      const items=[...pop.querySelectorAll('*')].filter(e=>e.children.length===0 && (e.textContent||'').trim());
      const hit=items.find(e=>(e.textContent||'').trim()===w);
      if(!hit) return {err:'item not found', items:[...new Set(items.map(e=>e.textContent.trim()))].slice(0,8)};
      let c=hit; for(let i=0;i<4&&c;i++,c=c.parentElement){ if(c.getAttribute&&(c.getAttribute('role')||/^(BUTTON|LI|A)$/.test(c.tagName))) break; }
      (c||hit).click(); return {ok:w};
    }, want);
    await page.waitForTimeout(4500);
    const now = await page.locator('main button[aria-label="Language"]').first().innerText().catch(()=>'?');
    return {was, picked, now: now.trim()};
  };
  const out={};
  const en={}; for (const p of PAGES) en[p]=await grab(p);
  out.toTarget = await setLang(TARGET);
  if (out.toTarget.err) return out;
  const tr={}; for (const p of PAGES) tr[p]=await grab(p);
  // ignore data-ish lines: emails, versions, user agents, names, pure numbers/dates
  const dataish = s => /@|qa_d_|QA (Alice|Bob|Carol|Dave|Guest|Owner|Admin|Outsider|Fixtures|Workspace)|Mozilla|Chrome\/|\d{1,3}\.\d|^\d|^v?\d+\.\d+|R4Q|U4Q|W4Q|O4Q|C4Q|D2/.test(s);
  out.untranslated={};
  for (const p of PAGES) {
    const set=new Set(tr[p]);
    const same=en[p].filter(s=>set.has(s) && s.length>3 && !dataish(s) && /[a-z]{3}/.test(s));
    if (same.length) out.untranslated[p]=[...new Set(same)].slice(0,14);
  }
  out.counts = Object.fromEntries(PAGES.map(p=>[p, `${en[p].length}en/${tr[p].length}tr`]));
  out.restore = await setLang('English');
  return out;
};
