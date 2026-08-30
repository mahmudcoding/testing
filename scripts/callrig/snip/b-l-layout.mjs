import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  return await page.evaluate(()=>{
    const q=window.__qa;
    const tiles=[...document.querySelectorAll('[data-testid="participant-tile"]')];
    const view=[...document.querySelectorAll('button')].filter(q.vis).find(x=>/ view$/i.test(q.nameOf(x).trim()));
    return {
      url: location.pathname,
      viewToggleLabel: view?q.nameOf(view).trim():null,
      tiles: tiles.map(n=>{const r=n.getBoundingClientRect();
        return {who:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,26),
          w:Math.round(r.width),h:Math.round(r.height), video:!!n.querySelector('video'),
          ids:[...n.querySelectorAll('[data-testid]')].map(b=>b.getAttribute('data-testid')).filter(t=>/pin|badge|global/i.test(t))}}),
      pinIsh:[...document.querySelectorAll('[data-testid]')].filter(q.boxVis)
        .filter(n=>/pin|global/i.test(n.getAttribute('data-testid')))
        .map(n=>({t:n.getAttribute('data-testid'), text:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,50)})),
      filmstripIds:[...new Set([...document.querySelectorAll('[data-testid]')].filter(q.boxVis)
        .map(n=>n.getAttribute('data-testid')).filter(t=>/film|strip|grid|page/i.test(t)))],
      notices: q.notices().map(n=>n.text).slice(0,4)
    };
  });
};
