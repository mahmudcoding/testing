const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
const comp = (page)=>page.locator('div[contenteditable="true"][aria-label="Compose message"]');
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', gen='C4QCGENERAL0001', priv='C4QCPRIVATE0001';
  const out={};
  const go=async(c)=>{ await page.goto(`https://airion-cargo.store/w/${ws}/c/${c}`); await page.waitForTimeout(6000); };
  const txt=()=>comp(page).evaluate(e=>e.innerText.trim());
  // 1. type a draft in #general, switch to #private via the sidebar, come back
  await go(gen); await empty(page, comp(page));
  await comp(page).type('QA-S2-DRAFT-GENERAL', {delay:40}); await page.waitForTimeout(1200);
  out.typedGeneral=await txt();
  const side=(name)=>page.locator('nav a, aside a, [data-testid*="sidebar"] a').filter({hasText:name}).first();
  const s=side('qa-private');
  out.sidebarPrivate=await s.count();
  if(out.sidebarPrivate){ await s.click(); await page.waitForTimeout(4000); }
  else { await go(priv); }
  out.inPrivate={url:page.url().slice(-16), composer:await txt()};
  // 2. type a different draft here
  await empty(page, comp(page));
  await comp(page).type('QA-S2-DRAFT-PRIVATE', {delay:40}); await page.waitForTimeout(1200);
  const g=side('qa-general');
  if(await g.count()){ await g.click(); await page.waitForTimeout(4000); }
  else { await go(gen); }
  out.backInGeneral={url:page.url().slice(-16), composer:await txt()};
  // 3. and back to private again
  if(out.sidebarPrivate){ await side('qa-private').click(); await page.waitForTimeout(4000); }
  out.backInPrivate=await txt();
  // 4. survive a full page reload?
  await page.reload(); await page.waitForTimeout(7000);
  out.afterReload=await txt();
  // cleanup both composers
  await empty(page, comp(page));
  await go(gen); await empty(page, comp(page));
  return out;
};
