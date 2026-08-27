import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const F='qa-e-note.txt';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const apiFav = `(async()=>{ const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope=own',{credentials:'include'});
  const j=await r.json().catch(()=>({})); const a=j.files||j.data||[];
  return a.map(f=>f.filename+':'+f.is_favorite).join(' , '); })()`;
const menuDump = `(() => { ${VISFN} ${boxVisFn}
  const b=[...document.querySelectorAll('[role=menu],[data-radix-popper-content-wrapper]')].filter(boxVis);
  const p=b[b.length-1]; return p? interactives(p).map(x=>x.label.slice(0,26)).join(' | ') : 'no menu'; })()`;
async function openRowMenu(page) {
  await page.locator('main button').filter({hasText:F}).first().hover();
  await page.waitForTimeout(1300);
  return await page.evaluate(`(() => { ${VISFN}
    const tiles=[...document.querySelectorAll('main button')].filter(b=>(b.textContent||'').includes(${JSON.stringify(F)}));
    if(!tiles.length) return 'no tile';
    const tr=tiles[0].getBoundingClientRect();
    const cands=[...document.querySelectorAll('button[aria-label="More actions"]')].filter(vis);
    if(!cands.length) return 'no visible More actions';
    cands.sort((a,b)=>Math.abs(a.getBoundingClientRect().y-tr.y)-Math.abs(b.getBoundingClientRect().y-tr.y));
    cands[0].click();
    return 'opened, tileY='+Math.round(tr.y)+' btnY='+Math.round(cands[0].getBoundingClientRect().y)+' nVisible='+cands.length; })()`);
}
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.api_before = await page.evaluate(apiFav);
  out.hoverLabel_before = await page.evaluate(`(() => { ${VISFN}
    return [...document.querySelectorAll('button')].filter(b=>vis(b)&&/favorite/i.test(b.getAttribute('aria-label')||'')).map(b=>b.getAttribute('aria-label')).join(','); })()`);
  out.open1 = await openRowMenu(page); await page.waitForTimeout(1800);
  out.menu_before = await page.evaluate(menuDump);
  out.clickFav = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const b=[...document.querySelectorAll('[role=menu],[data-radix-popper-content-wrapper]')].filter(boxVis);
    const p=b[b.length-1]; if(!p) return 'no menu';
    return clickDeepest(p, /favorite/i); })()`);
  await page.waitForTimeout(3500);
  out.api_after = await page.evaluate(apiFav);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  out.hoverLabel_after = await page.evaluate(`(() => { ${VISFN}
    return [...document.querySelectorAll('button')].filter(b=>vis(b)&&/favorite/i.test(b.getAttribute('aria-label')||'')).map(b=>b.getAttribute('aria-label')).join(','); })()`);
  out.open2 = await openRowMenu(page); await page.waitForTimeout(1800);
  out.menu_after = await page.evaluate(menuDump);
  await page.keyboard.press('Escape');
  return out;
};
