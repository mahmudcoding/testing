import {WS, BASE} from './e-p2-helpers.mjs';
const sidebar = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  const toggle=[...document.querySelectorAll('button')].filter(vis)
    .find(e=>/(Collapse|Expand) chat sidebar/i.test(e.getAttribute('aria-label')||''));
  const main=document.querySelector('main');
  const chanLinks=[...document.querySelectorAll('a')].filter(vis).filter(a=>/\/c\//.test(a.getAttribute('href')||''));
  return {toggleLabel: toggle? toggle.getAttribute('aria-label') : '(no toggle)',
    collapsed: toggle? /Expand/i.test(toggle.getAttribute('aria-label')) : null,
    mainLeft: main? Math.round(main.getBoundingClientRect().left) : null,
    channelLinkWidth: chanLinks.length? Math.round(chanLinks[0].getBoundingClientRect().width) : null};
};
export default async ({page}) => {
  const out={};
  for (const r of ['/c/C4QEGENERAL0001','/files','/calendar','/directories','/c/C4QEGENERAL0001']) {
    await page.goto(`${BASE}/w/${WS}${r}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4500);
    out[r+' ('+(out[r]?'2nd':'1st')+')'] = await page.evaluate(sidebar);
  }
  return out;
};
