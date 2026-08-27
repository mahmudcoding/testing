// Change a Visibility dropdown and report what was saved. QA_SEL=label, QA_PICK=option text
export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/privacy',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const want=process.env.QA_SEL, pick=process.env.QA_PICK;
  const out={};
  const combos = page.locator('main button[role=combobox]');
  out.combos = await combos.evaluateAll(els=>els.map(e=>({aria:e.getAttribute('aria-label')||'', txt:(e.innerText||'').trim().slice(0,30)})));
  const idx = process.env.QA_IDX !== undefined ? Number(process.env.QA_IDX)
            : out.combos.findIndex(c=>(c.aria+' '+c.txt).toLowerCase().includes(want.toLowerCase()));
  if (idx<0 || idx>=out.combos.length) { out.err='combobox not matched'; return out; }
  out.targetIndex = idx;
  const el = combos.nth(idx);
  await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
  await el.click(); await page.waitForTimeout(1500);
  out.options = await page.evaluate(()=>[...document.querySelectorAll('[role=option]')].map(e=>(e.innerText||'').trim()));
  if (!pick) { await page.keyboard.press('Escape'); return out; }
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(u.pathname.startsWith('/api/v1/')) reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  await page.locator('[role=option]').filter({hasText:pick}).first().click();
  await page.waitForTimeout(1500);
  const save = page.locator('main button').filter({hasText:/^(Save preferences|Save changes|Save)$/});
  out.saveButtons = await save.count();
  if (out.saveButtons){ await save.last().scrollIntoViewIfNeeded(); await save.last().click(); await page.waitForTimeout(3500); }
  else await page.waitForTimeout(2500);
  out.reqs=reqs.slice(); page.off('response', on);
  out.now = await el.innerText();
  return out;
};
