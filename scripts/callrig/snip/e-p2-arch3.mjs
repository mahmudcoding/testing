import {WS, BASE, VISFN} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  return await page.evaluate(({}) => {
    const vis = e => { let n=e,o=1; while(n&&n!==document.documentElement){const s=getComputedStyle(n); if(s.display==='none'||s.visibility==='hidden')return false; o*=parseFloat(s.opacity||'1'); n=n.parentElement;} return o>0.01; };
    // enumerate EVERYTHING interactive in the sidebar, no text filter
    const side = document.querySelector('aside') || document.querySelector('nav');
    const scope = side || document.body;
    const els=[...scope.querySelectorAll('button,a,[role=button],[role=menuitem],[role=tab],input,summary')];
    return {
      sidebarTag: side ? side.tagName+'.'+(side.className||'').slice(0,40) : 'NONE',
      count: els.length,
      items: els.filter(vis).map(e=>({
        tag:e.tagName, label:(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,42),
        tid:e.getAttribute('data-testid')||null, exp:e.getAttribute('aria-expanded')
      })).slice(0,60)
    };
  }, {});
};
