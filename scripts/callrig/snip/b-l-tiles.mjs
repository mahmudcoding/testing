import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  return await page.evaluate(()=>{
    const w=window.__qa;
    const tiles=[...document.querySelectorAll('[data-testid="participant-tile"]')];
    const grid=document.querySelector('[data-testid*="grid" i]');
    return {
      tileCount: tiles.length,
      tilesVisible: tiles.filter(w.boxVis).length,
      tiles: tiles.map(n=>({text:(n.innerText||'').replace(/\s+/g,' ').trim().slice(0,60),
        vis:w.boxVis(n), w:Math.round(n.getBoundingClientRect().width), h:Math.round(n.getBoundingClientRect().height),
        hasVideo: !!n.querySelector('video'), id:n.getAttribute('data-participant-id')||n.id||null})),
      gridTestid: grid?grid.getAttribute('data-testid'):null,
      mainText: (document.querySelector('main')||document.body).innerText.replace(/\s+/g,' ').slice(0,400),
      allTestids: [...new Set([...document.querySelectorAll('[data-testid]')].filter(w.boxVis).map(n=>n.getAttribute('data-testid')))].slice(0,60)
    };
  });
};
