/* sector L: diagnostics switch -> Nerd Stats button. In-app navigation only. */
import { DOM } from './lib.mjs';
const toSettings = async (page) => {
  const hasPip = await page.evaluate(()=>!!document.querySelector('[data-testid="draggable-pip"]'));
  if(!hasPip){
    await page.evaluate(()=>window.__qa.clickDeepest(/^Minimize to picture-in-picture$/i));
    await page.waitForTimeout(2500);
  }
  await page.evaluate(DOM);
  await page.evaluate(()=>window.__qa.clickDeepest(/^Settings$/i));
  await page.waitForTimeout(3000);
  await page.evaluate(DOM);
  const ok = await page.evaluate(()=>{
    const q=window.__qa;
    const a=[...document.querySelectorAll('a[href]')].filter(q.vis).find(n=>/\/settings\/calls$/.test(n.getAttribute('href')||''));
    if(!a) return false; a.click(); return true;
  });
  await page.waitForTimeout(3000);
  await page.evaluate(DOM);
  return {ok, url:page.url()};
};
const expand = async (page) => {
  const hasPip = await page.evaluate(()=>!!document.querySelector('[data-testid="draggable-pip"]'));
  if(hasPip){
    await page.evaluate(()=>{const q=window.__qa;
      const p=document.querySelector('[data-testid="draggable-pip"]');
      const b=[...p.querySelectorAll('button')].find(x=>/^Expand$/i.test(q.nameOf(x).trim())); b&&b.click();});
    await page.waitForTimeout(3000);
    await page.evaluate(DOM);
  }
  return page.evaluate(()=>{
    const q=window.__qa;
    const btns=[...document.querySelectorAll('button')].filter(q.vis).map(b=>q.nameOf(b).replace(/\s+/g,' ').trim().slice(0,40));
    return {url:location.pathname, buttons:btns,
      nerdish:btns.filter(n=>/nerd|stat|diag/i.test(n)),
      panels:[...new Set([...document.querySelectorAll('[data-testid]')].filter(q.boxVis)
        .map(n=>n.getAttribute('data-testid')).filter(t=>/stat|nerd|diag/i.test(t)))]};
  });
};
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  out.a_toolbarBefore = await expand(page);
  out.nav = await toSettings(page);
  out.flip = await page.evaluate(()=>{
    const q=window.__qa;
    const s=[...document.querySelectorAll('[role=switch]')].find(n=>/Show call diagnostics/i.test(q.nameOf(n)));
    if(!s) return {ok:false, switches:[...document.querySelectorAll('[role=switch]')].map(n=>q.nameOf(n).slice(0,45))};
    s.scrollIntoView({block:'center'});
    const before=s.getAttribute('aria-checked');
    s.click();
    return {ok:true, before};
  });
  await page.waitForTimeout(2000);
  out.switchAfter = await page.evaluate(()=>{
    const q=window.__qa;
    const s=[...document.querySelectorAll('[role=switch]')].find(n=>/Show call diagnostics/i.test(q.nameOf(n)));
    return s?{checked:s.getAttribute('aria-checked'), vis:q.vis(s)}:null;
  });
  out.persistedLS = await page.evaluate(()=>{
    try{ return Object.keys(localStorage).filter(k=>/diag|nerd|stat/i.test(k)).map(k=>k+'='+localStorage.getItem(k)); }catch(e){return String(e);}
  });
  out.b_toolbarAfter = await expand(page);
  return out;
};
