/* Open the post-call detail page and enumerate tabs + content. QA_MID = meeting id, QA_TAB optional */
import { DOM, safeClick } from './lib.mjs';
export default async ({ page }) => {
  const WS='W4QEF1XTURESO01'; const mid=process.env.QA_MID;
  const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls/${mid}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.evaluate(DOM);
  if (process.env.QA_TAB) {
    out.tab = await page.evaluate((t)=>window.__qa.clickDeepest(new RegExp(t,'i')), process.env.QA_TAB);
    await page.waitForTimeout(2500);
    await page.evaluate(DOM);
  }
  out.url=page.url();
  out.main = await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    return (m.innerText||'').replace(/\s+/g,' ').slice(0,2000);
  });
  out.ctrls = await page.evaluate(()=>{
    const q=window.__qa; const m=document.querySelector('main')||document.body;
    return [...m.querySelectorAll('button,a,[role=tab],input,select')].filter(q.vis)
      .map(n=>({n:q.nameOf(n).slice(0,70), t:n.getAttribute('data-testid'), tag:n.tagName,
        role:n.getAttribute('role'), sel:n.getAttribute('aria-selected'),
        dis:n.disabled===true||n.getAttribute('aria-disabled')==='true'}));
  });
  return out;
};
