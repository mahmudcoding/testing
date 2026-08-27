import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  return await page.evaluate(() => {
    const d=[...document.querySelectorAll('[role=dialog]')].filter(window.__qa.boxVis).filter(x=>x.getAttribute('data-testid')!=='call-overlay-expanded').pop();
    if(!d) return null;
    const inter=[...d.querySelectorAll('button,input,label,[role=checkbox],[role=option],[role=menuitem],[tabindex],li,[data-testid]')]
      .filter(window.__qa.boxVis)
      .map(n=>({tag:n.tagName, tid:n.getAttribute('data-testid'), role:n.getAttribute('role'),
                t:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,44),
                dis:n.disabled ?? n.getAttribute('aria-disabled'), ariaDis:n.getAttribute('data-disabled'),
                cls:(typeof n.className==='string'? n.className.split(/\s+/).slice(0,3).join(' '):'')}));
    return { count: inter.length, inter };
  });
};
