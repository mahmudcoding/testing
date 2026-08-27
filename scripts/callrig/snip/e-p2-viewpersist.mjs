import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const state = `(() => { ${VISFN}
  const m=document.querySelector('main');
  const vb=[...m.querySelectorAll('button')].filter(b=>vis(b)&&/view$/i.test(b.getAttribute('aria-label')||''))
    .map(b=>b.getAttribute('aria-label')+'='+(b.getAttribute('aria-pressed')??'-'));
  const tile=[...m.querySelectorAll('button')].filter(b=>vis(b)&&/\\.(txt|png)/.test(b.textContent||''))[0];
  const sb=[...document.querySelectorAll('button')].find(b=>vis(b)&&/sidebar/i.test(b.getAttribute('aria-label')||''));
  return { view: vb.join(' '), tileBox: tile? Math.round(tile.getBoundingClientRect().width)+'x'+Math.round(tile.getBoundingClientRect().height):null,
    sidebarToggle: sb? sb.getAttribute('aria-label'):null }; })()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.s0_initial = await page.evaluate(state);
  // set List view AND collapse the sidebar in the same session
  await page.getByRole('button',{name:'List view'}).first().click();
  await page.waitForTimeout(2000);
  await page.locator('button[aria-label="Collapse chat sidebar"], button[aria-label="Expand chat sidebar"]').first().click();
  await page.waitForTimeout(2000);
  out.s1_bothChanged = await page.evaluate(state);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(7000);
  out.s2_afterReload1 = await page.evaluate(state);
  // set List again, then navigate away within the app and back
  await page.getByRole('button',{name:'List view'}).first().click();
  await page.waitForTimeout(2000);
  out.s3_listAgain = await page.evaluate(state);
  await page.goto(BASE+'/w/'+WS+'/directories', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.s4_afterRoundTrip = await page.evaluate(state);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(7000);
  out.s5_afterReload2 = await page.evaluate(state);
  // restore sidebar
  await page.locator('button[aria-label="Expand chat sidebar"]').first().click().catch(()=>{});
  return out;
};
