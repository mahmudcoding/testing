import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const sb = `(() => { ${VISFN}
  const b=[...document.querySelectorAll('button')].find(x=>vis(x)&&/sidebar/i.test(x.getAttribute('aria-label')||''));
  const main=document.querySelector('main');
  const st=(b?b.getAttribute('aria-label'):'?')==='Expand chat sidebar'?'COLLAPSED':'expanded';
  return st+' (mainLeft='+Math.round(main?main.getBoundingClientRect().left:-1)+', w='+Math.round(innerWidth)+')'; })()`;
export default async ({page}) => {
  const out={};
  const routes = [['channel','/c/C4QEGENERAL0001'],['directories','/directories'],['files','/files'],['calendar','/calendar'],['saved','/chat/saved']];
  out.freshLoadPerRoute = {};
  for (const [tag,r] of routes) {
    await page.goto(BASE+'/w/'+WS+r, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6500);
    out.freshLoadPerRoute[tag] = await page.evaluate(sb);
  }
  // toggle on a channel, then walk routes without reloading the app shell
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  out.channelBeforeToggle = await page.evaluate(sb);
  await page.locator('button[aria-label="Collapse chat sidebar"], button[aria-label="Expand chat sidebar"]').first().click();
  await page.waitForTimeout(2000);
  out.channelAfterToggle = await page.evaluate(sb);
  // in-app navigation via sidebar links (no full page load)
  out.afterInAppNav = {};
  for (const [tag,sel] of [['directoriesLink','a[href$="/directories"]'],['savedLink','a[href$="/chat/saved"]']]) {
    const n = await page.locator(sel).count();
    if(!n){ out.afterInAppNav[tag]='link not found'; continue; }
    await page.locator(sel).first().click();
    await page.waitForTimeout(4000);
    out.afterInAppNav[tag] = await page.evaluate(sb);
  }
  return out;
};
