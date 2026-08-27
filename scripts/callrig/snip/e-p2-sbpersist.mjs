import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const sb = `(() => { ${VISFN}
  const b=[...document.querySelectorAll('button')].find(x=>vis(x)&&/sidebar/i.test(x.getAttribute('aria-label')||''));
  const main=document.querySelector('main');
  return (b? b.getAttribute('aria-label'):'?') + ' mainLeft=' + Math.round(main? main.getBoundingClientRect().left : -1); })()`;
export default async ({page}) => {
  const out=[];
  const rec = async (tag) => out.push(tag+' :: '+await page.evaluate(sb));
  const toggle = async () => { await page.locator('button[aria-label="Collapse chat sidebar"], button[aria-label="Expand chat sidebar"]').first().click(); await page.waitForTimeout(2000); };
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'}); await page.waitForTimeout(7000);
  await rec('1 load');
  await toggle(); await rec('2 toggled');
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(7000); await rec('3 reload');
  await toggle(); await rec('4 toggled back');
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(7000); await rec('5 reload');
  await page.goto(BASE+'/w/'+WS+'/directories', {waitUntil:'domcontentloaded'}); await page.waitForTimeout(5000); await rec('6 nav to directories');
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'}); await page.waitForTimeout(6000); await rec('7 back to files');
  return {trace: out};
};
