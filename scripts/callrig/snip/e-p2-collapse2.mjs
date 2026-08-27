import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const probe = `(() => { ${VISFN}
  const links=[...document.querySelectorAll('a[href*="/c/"]')];
  return {
    ch: links.map(a=>(a.textContent||'').trim().slice(0,12)+'@'+Math.round(a.getBoundingClientRect().left)+'w'+Math.round(a.getBoundingClientRect().width)+(vis(a)?'V':'x')).join(' '),
    mainLeft: Math.round((document.querySelector('main')?.getBoundingClientRect().left)||-1),
    toggle: (()=>{const b=[...document.querySelectorAll('button')].find(b=>/sidebar/i.test(b.getAttribute('aria-label')||'')); return b? b.getAttribute('aria-label')+'@'+Math.round(b.getBoundingClientRect().left):null;})(),
    sidebarCtrls: interactives(document).filter(d=>d.x<400 && d.y>60 && d.y<500).map(d=>d.label.slice(0,22)).join(' | ')
  };
})()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  out.s1_initial = await page.evaluate(probe);
  const t = () => page.locator('button[aria-label="Collapse chat sidebar"], button[aria-label="Expand chat sidebar"]').first();
  await t().click(); await page.waitForTimeout(1500);
  out.s2_afterToggle = await page.evaluate(probe);
  await t().click(); await page.waitForTimeout(1500);
  out.s3_afterToggleBack = await page.evaluate(probe);
  return out;
};
