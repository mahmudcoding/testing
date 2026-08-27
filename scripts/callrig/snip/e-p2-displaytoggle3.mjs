import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const st = `(() => { ${VISFN} ${boxVisFn}
  const ds=[...document.querySelectorAll('aside,[role=dialog]')].filter(boxVis)
    .filter(e=>/Display settings/i.test(e.innerText||''));
  const p=ds[0];
  const h=document.documentElement;
  return {displayPanelVisible: !!p,
    panelText: p? (p.innerText||'').replace(/\\s+/g,' ').slice(0,110) : null,
    theme:h.getAttribute('data-theme'), density:h.getAttribute('data-density'),
    sidebarMode:h.getAttribute('data-chat-sidebar-mode'), bodyKids:document.body.children.length}; })()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7500);
  out.a_fresh = await page.evaluate(st);
  await page.keyboard.press('Meta+Shift+KeyT');
  const t=[]; for(let i=0;i<8;i++){ await page.waitForTimeout(600); const s=await page.evaluate(st); t.push(s.displayPanelVisible?'PANEL':'none'); }
  out.b_shortcutTrace = t.join(',');
  out.b_after = await page.evaluate(st);
  // press again — should toggle back if it toggled
  await page.keyboard.press('Meta+Shift+KeyT');
  await page.waitForTimeout(3000);
  out.c_secondPress = await page.evaluate(st);
  return out;
};
