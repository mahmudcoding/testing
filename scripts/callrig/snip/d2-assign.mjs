// Assign a role via the Roles page. QA_SCOPE, QA_MEMBER, QA_ROLE.
// The pickers sit below the fold — scrollIntoViewIfNeeded() before clicking,
// or the click lands outside the viewport and looks like a dead control.
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const scope = process.env.QA_SCOPE||'workspace', member = process.env.QA_MEMBER, role = process.env.QA_ROLE;
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=${scope}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const steps=[];
  const pick = async (which, want) => {
    const el = page.locator('main [role="combobox"]').nth(which);
    await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
    await el.click(); await page.waitForTimeout(1500);
    const opts = await page.evaluate(()=>[...document.querySelectorAll('[role=option]')].map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()));
    steps.push({picker: which, options: opts});
    const hit = page.locator('[role=option]').filter({hasText: want}).first();
    await hit.scrollIntoViewIfNeeded().catch(()=>{});
    await hit.click(); await page.waitForTimeout(1000);
    steps.push({picked: await el.innerText()});
  };
  await pick(0, member);
  await pick(1, role);

  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(u.pathname.startsWith('/api/')) reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  const sub = page.locator('main button:has-text("Assign role")').last();
  await sub.scrollIntoViewIfNeeded();
  steps.push('submitDisabled:'+await sub.isDisabled());
  if (!await sub.isDisabled()) await sub.click();
  await page.waitForTimeout(3500);
  const captured = reqs.slice(); page.off('response', on);
  const txt = await page.evaluate(()=> (document.body.innerText||'').replace(/\s+/g,' '));
  const i = txt.indexOf('MEMBER ROLES');
  return {steps, reqs: captured.filter(r=>/role/i.test(r)), memberRoles: txt.slice(i, i+450)};
};
