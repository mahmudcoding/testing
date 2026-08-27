import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const view = `(() => { ${VISFN}
  const m=document.querySelector('main');
  const vb=[...m.querySelectorAll('button')].filter(b=>vis(b)&&/view$/i.test(b.getAttribute('aria-label')||''))
    .filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>b.getAttribute('aria-label'));
  const tile=[...m.querySelectorAll('button')].filter(b=>vis(b)&&/\\.(txt|png)/.test(b.textContent||''))[0];
  return (vb[0]||'?')+' tile='+(tile? Math.round(tile.getBoundingClientRect().width)+'x'+Math.round(tile.getBoundingClientRect().height):'none'); })()`;
export default async ({page}) => {
  const out=[];
  const rec = async t => out.push(t+' :: '+await page.evaluate(view));
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'}); await page.waitForTimeout(7000);
  await rec('1 fresh load');
  await page.getByRole('button',{name:'List view'}).first().click(); await page.waitForTimeout(2200);
  await rec('2 chose List');
  // in-app navigation via the rail, then back via the rail
  await page.locator('button[aria-label="Calendar"]').first().click(); await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Files"]').first().click(); await page.waitForTimeout(5000);
  await rec('3 rail round-trip (in-app)');
  await page.getByRole('button',{name:'List view'}).first().click(); await page.waitForTimeout(2200);
  await rec('4 chose List again');
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(7000);
  await rec('5 full reload');
  return {trace: out};
};
