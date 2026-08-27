import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  const probe = `(() => { ${VISFN}
    const links=[...document.querySelectorAll('a[href*="/c/"]')];
    return {
      chAll: links.map(a=>({t:(a.textContent||'').trim().slice(0,18), x:Math.round(a.getBoundingClientRect().left), w:Math.round(a.getBoundingClientRect().width), vis:vis(a)})),
      mainLeft: Math.round((document.querySelector('main')?.getBoundingClientRect().left)||-1),
      navRects: [...document.querySelectorAll('nav')].map(n=>({x:Math.round(n.getBoundingClientRect().left), w:Math.round(n.getBoundingClientRect().width)})),
      chrome: interactives(document).filter(d=>d.x<400 && !(document.querySelector('main')||document.body).contains(document.elementFromPoint(d.x+2,d.y+2)))
    };
  })()`;
  out.collapsed = await page.evaluate(probe);
  // now expand again
  const exp = page.locator('button[aria-label="Expand chat sidebar"]');
  out.expandFound = await exp.count();
  if (out.expandFound) { await exp.first().click(); await page.waitForTimeout(1200); }
  out.expanded = await page.evaluate(probe);
  return out;
};
