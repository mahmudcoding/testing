/* sector L: reach /w/<ws>/settings/calls while staying in the call (minimize + in-app nav)
   and enumerate everything on it. */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  const out={};
  // minimize if we are on the expanded surface
  const surf = await page.evaluate(()=>!!document.querySelector('[data-testid="call-surface"]'));
  if(surf){
    await page.evaluate(()=>window.__qa.clickDeepest(/^Minimize to picture-in-picture$/i));
    await page.waitForTimeout(2500);
  }
  out.pip = await page.evaluate(()=>!!document.querySelector('[data-testid="draggable-pip"]'));
  // in-app nav: Settings in the rail
  out.nav = await page.evaluate(()=>window.__qa.clickDeepest(/^Settings$/i));
  await page.waitForTimeout(3500);
  await page.evaluate(DOM);
  out.url1 = page.url();
  // find the Calls section link
  out.callsLink = await page.evaluate(()=>{
    const q=window.__qa;
    const a=[...document.querySelectorAll('a[href],button')].filter(q.vis)
      .find(n=>/^Calls$/i.test(q.nameOf(n).trim()) && !/\/calls$/.test(n.getAttribute('href')||'x'));
    const links=[...document.querySelectorAll('a[href]')].filter(q.vis)
      .map(n=>({n:q.nameOf(n).trim().slice(0,30), h:n.getAttribute('href')})).filter(x=>/settings/.test(x.h||''));
    return {links, picked:a?q.nameOf(a).trim():null};
  });
  const target = await page.evaluate(()=>{
    const q=window.__qa;
    const a=[...document.querySelectorAll('a[href]')].filter(q.vis).find(n=>/\/settings\/calls$/.test(n.getAttribute('href')||''));
    if(a){ a.click(); return a.getAttribute('href'); }
    return null;
  });
  out.clickedHref = target;
  await page.waitForTimeout(3500);
  await page.evaluate(DOM);
  out.url2 = page.url();
  out.page = await page.evaluate(()=>{
    const q=window.__qa;
    const m=document.querySelector('main')||document.body;
    const inter=[...m.querySelectorAll('button,input,select,textarea,[role=switch],[role=slider],[role=radio],[role=checkbox],a[href]')].filter(q.vis);
    return {
      heading: [...m.querySelectorAll('h1,h2,h3')].filter(q.vis).map(h=>(h.innerText||'').trim().slice(0,60)),
      text: (m.innerText||'').replace(/\s+/g,' ').trim().slice(0,900),
      controls: inter.map(n=>({tag:n.tagName, role:n.getAttribute('role')||n.type||null,
        name:q.nameOf(n).replace(/\s+/g,' ').trim().slice(0,60),
        checked:n.getAttribute('aria-checked'), val:n.value||n.getAttribute('aria-valuenow')||null,
        d:n.disabled||n.getAttribute('aria-disabled')==='true', testid:n.getAttribute('data-testid')||null}))
    };
  });
  out.stillInCall = await page.evaluate(()=>!!document.querySelector('[data-testid="draggable-pip"]'));
  return out;
};
