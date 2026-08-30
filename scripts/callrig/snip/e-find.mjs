import { DOM } from './lib.mjs';
export default async ({ page }) => {
  const re = process.env.QA_MATCH;
  await page.evaluate(DOM);
  return await page.evaluate((r)=>{
    const q=window.__qa; const rx=new RegExp(r,'i');
    const all=[...document.querySelectorAll('*')].filter(n=>{
      const t=(n.textContent||'')+' '+(n.getAttribute('aria-label')||'');
      return rx.test(t) && !([...n.children].some(c=>rx.test((c.textContent||'')+' '+(c.getAttribute('aria-label')||''))));
    });
    return all.slice(0,12).map(n=>({tag:n.tagName, cls:(n.className&&n.className.baseVal!==undefined?n.className.baseVal:String(n.className||'')).slice(0,60),
      testid:n.getAttribute('data-testid'), role:n.getAttribute('role'), name:q.nameOf(n).slice(0,60), vis:q.vis(n), box:q.boxVis(n),
      parent:n.parentElement?n.parentElement.tagName+'/'+(n.parentElement.getAttribute('data-testid')||''):null}));
  }, re);
};
