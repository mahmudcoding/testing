/* sector L: full visible-button enumeration + the global pin badge's accessible name */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  return await page.evaluate(()=>{
    const q=window.__qa;
    const all=[...document.querySelectorAll('button,a[href],[role=button],[role=switch],[role=tab]')];
    const visible=all.filter(q.vis);
    const badge=document.querySelector('[data-testid="participant-pinned-for-everyone"]');
    return {
      visibleCount: visible.length,
      allCount: all.length,
      visible: visible.map(b=>({n:q.nameOf(b).replace(/\s+/g,' ').trim().slice(0,45)||'(no name)',
        t:b.getAttribute('data-testid')||null, p:b.getAttribute('aria-pressed'),
        d:b.disabled||b.getAttribute('aria-disabled')==='true'})),
      hiddenNamed: all.filter(b=>!q.vis(b)).map(b=>q.nameOf(b).replace(/\s+/g,' ').trim().slice(0,45)).filter(Boolean).slice(0,20),
      badge: badge?{
        ariaLabel: badge.getAttribute('aria-label'),
        title: badge.getAttribute('title'),
        innerText: (badge.innerText||'').trim(),
        textContent: (badge.textContent||'').trim(),
        boxVis: q.boxVis(badge),
        rect: (r=>({w:Math.round(r.width),h:Math.round(r.height)}))(badge.getBoundingClientRect()),
        html: badge.outerHTML.replace(/\s+/g,' ').slice(0,300),
        parentText: badge.parentElement?(badge.parentElement.innerText||'').replace(/\s+/g,' ').trim().slice(0,80):null
      }:null,
      callSurfaceText: (document.querySelector('[data-testid="call-surface"]')||document.body)
        .innerText.replace(/\s+/g,' ').trim().slice(0,300)
    };
  });
};
