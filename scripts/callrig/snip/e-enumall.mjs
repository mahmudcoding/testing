/* Enumerate every interactive node, per selector, with state. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  if (process.env.QA_URL) { await page.goto(process.env.QA_URL,{waitUntil:'domcontentloaded'}); await page.waitForTimeout(9000); }
  await page.evaluate(DOM);
  return await page.evaluate(()=>{
    const q=window.__qa;
    const sel = {button:'button', a:'a[href]', roleButton:'[role=button]', tabindex:'[tabindex]',
                 input:'input', svgClickable:'[onclick]', star:'[aria-label*="star" i]'};
    const out={url:location.href, counts:{}, items:{}};
    for (const [k,s] of Object.entries(sel)) {
      const all=[...document.querySelectorAll(s)];
      const visible=all.filter(n=>q.boxVis(n));
      out.counts[k]={total:all.length, boxVis:visible.length, hitVis:visible.filter(n=>q.vis(n)).length};
      out.items[k]=visible.map(n=>({name:q.nameOf(n).slice(0,60), tag:n.tagName,
        w:Math.round(n.getBoundingClientRect().width), h:Math.round(n.getBoundingClientRect().height),
        dis:n.disabled===true||n.getAttribute('aria-disabled')==='true', ti:n.getAttribute('tabindex')})).slice(0,25);
    }
    out.text=(document.body.innerText||'').replace(/\s+/g,' ').slice(0,800);
    return out;
  });
};
