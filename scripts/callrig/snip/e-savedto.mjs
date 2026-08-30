import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  return await page.evaluate(()=>{
    const q=window.__qa;
    const rx=/Saved to/i;
    const all=[...document.querySelectorAll("body *")].filter(n=>n.tagName!=="SCRIPT"&&n.tagName!=="STYLE").filter(n=>rx.test(n.textContent||'') && ![...n.children].some(c=>rx.test(c.textContent||'')));
    return all.map(n=>({tag:n.tagName, testid:n.getAttribute('data-testid'), href:n.getAttribute('href'),
      text:(n.innerText||n.textContent||'').replace(/\s+/g,' ').trim(),
      vis:q.vis(n), boxVis:q.boxVis(n), op:q.opacity(n),
      rect:(r=>({w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.left),y:Math.round(r.top)}))(n.getBoundingClientRect()),
      parentTag:n.parentElement?.tagName, parentHref:n.parentElement?.getAttribute('href')||null,
      clickable:!!n.closest('a,button,[role=button],[role=link]')}));
  });
};
