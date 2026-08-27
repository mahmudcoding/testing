import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  // how many "More actions" buttons exist at all, and where?
  out.allMoreActions = await page.evaluate(`(() => { ${VISFN}
    return [...document.querySelectorAll('button[aria-label="More actions"]')].map(b=>{
      const r=b.getBoundingClientRect(); const cs=getComputedStyle(b);
      return '@'+Math.round(r.x)+','+Math.round(r.y)+' op='+cs.opacity+' vis='+vis(b); }); })()`);
  for (const fname of ['qa-e-image.png','qa-e-note.txt']) {
    const o={};
    const tile = page.locator('main button').filter({hasText:fname}).first();
    await tile.hover(); await page.waitForTimeout(1400);
    const box = await tile.boundingBox();
    o.tileBox = box ? Math.round(box.x)+','+Math.round(box.y)+' '+Math.round(box.width)+'x'+Math.round(box.height) : null;
    // pick the More actions button nearest this tile
    o.chosen = await page.evaluate(`(() => { ${VISFN}
      const tiles=[...document.querySelectorAll('main button')].filter(b=>/${fname.replace('.','\\\\.')}/.test(b.textContent||''));
      const t=tiles[0]; if(!t) return 'no tile';
      const tr=t.getBoundingClientRect();
      const cands=[...document.querySelectorAll('button[aria-label="More actions"]')].filter(vis);
      if(!cands.length) return 'no visible More actions';
      cands.sort((a,b)=>Math.abs(a.getBoundingClientRect().y-tr.y)-Math.abs(b.getBoundingClientRect().y-tr.y));
      const c=cands[0]; const cr=c.getBoundingClientRect();
      window.__pick=c;
      return 'tileY='+Math.round(tr.y)+' pickY='+Math.round(cr.y)+' nCands='+cands.length; })()`);
    o.favBtnNearTile = await page.evaluate(`(() => { ${VISFN}
      const tiles=[...document.querySelectorAll('main button')].filter(b=>/${fname.replace('.','\\\\.')}/.test(b.textContent||''));
      const tr=tiles[0].getBoundingClientRect();
      const favs=[...document.querySelectorAll('button')].filter(b=>vis(b)&&/favorite/i.test(b.getAttribute('aria-label')||''));
      favs.sort((a,b)=>Math.abs(a.getBoundingClientRect().y-tr.y)-Math.abs(b.getBoundingClientRect().y-tr.y));
      return favs.length? favs[0].getAttribute('aria-label')+' @y'+Math.round(favs[0].getBoundingClientRect().y) : 'none'; })()`);
    await page.evaluate(`(() => { window.__pick && window.__pick.click(); })()`);
    await page.waitForTimeout(2000);
    o.menuItems = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
      const b=[...document.querySelectorAll('[role=menu],[data-radix-popper-content-wrapper]')].filter(boxVis);
      const p=b[b.length-1]; return p? interactives(p).map(x=>x.label.slice(0,26)).join(' | ') : 'no menu'; })()`);
    await page.keyboard.press('Escape'); await page.waitForTimeout(1400);
    out[fname]=o;
  }
  return out;
};
