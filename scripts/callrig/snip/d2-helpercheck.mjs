import { safeClick, watchNotices } from './lib.mjs';
export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const out={};
  // 1. the below-the-fold role picker that produced a false "dead control"
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=workspace`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  out.picker = await safeClick(page, 'main [role="combobox"]', {index:0});
  await page.waitForTimeout(1500);
  out.pickerOpened = await page.evaluate(()=>{
    const t=document.querySelector('main [role="combobox"]');
    return {expanded:t.getAttribute('aria-expanded'), options:document.querySelectorAll('[role=option]').length};
  });
  await page.keyboard.press('Escape').catch(()=>{});
  // 2. watchNotices around a known-toasting action: duplicate role name
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/roles?scope=company`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  await page.evaluate(()=>{const b=document.querySelectorAll('input[type=checkbox]')[5]; if(b&&!b.checked) b.click();});
  await page.locator('main input[placeholder="e.g. Moderators"]').first().fill('Member');
  await page.waitForTimeout(500);
  out.notices = await watchNotices(page, {ms:7000, trigger: async () => {
    await page.locator('main button').filter({hasText:/^Create role$/}).first().click();
  }});
  return out;
};
