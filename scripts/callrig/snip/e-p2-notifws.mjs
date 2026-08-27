import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const W2='W4OWJSPNXQJYZ5R';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const probe = `(() => { ${VISFN} ${boxVisFn}
  const bell=[...document.querySelectorAll('button')].find(b=>vis(b)&&/^Notifications/i.test(b.getAttribute('aria-label')||''));
  const boxes=[...document.querySelectorAll('[role=dialog],[role=menu],[data-radix-popper-content-wrapper]')].filter(boxVis);
  const p=boxes[boxes.length-1];
  return { bellLabel: bell? bell.getAttribute('aria-label'):null,
    bellBadge: bell? (bell.innerText||'').replace(/\\s+/g,''):null,
    panel: p? (p.innerText||'').replace(/\\n+/g,' | ').slice(0,700):'(no panel)' };
})()`;
const apiN = `(async()=>{ const r=await fetch('/api/v1/notifications?limit=20',{credentials:'include'}); let j=null; try{j=await r.json()}catch(e){}
  const d=j?.data??j; const a=Array.isArray(d)?d:(d?.notifications||d?.items||[]);
  return {s:r.status, n:a.length, unread:a.filter(x=>!x.is_read&&!x.read_at).length,
    rows:a.slice(0,6).map(x=>({t:(x.type||x.kind||'?'), ws:(x.workspace_id||x.workspaceId||'-'), read:!!(x.is_read||x.read_at), title:String(x.title||x.body||x.message||'').replace(/\\s+/g,' ').slice(0,60)}))}; })()`;
export default async ({page}) => {
  const out={};
  for (const [tag, w] of [['ws1_QAWorkspaceE', WS], ['ws2_QAESecond', W2]]) {
    await page.goto(BASE+'/w/'+w+'/directories', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(5500);
    const before = await page.evaluate(probe);
    await page.locator('button[aria-label^="Notifications"]').first().click();
    await page.waitForTimeout(2500);
    const after = await page.evaluate(probe);
    out[tag] = {bell: before.bellLabel, badge: before.bellBadge, panel: after.panel, api: await page.evaluate(apiN)};
    await page.keyboard.press('Escape'); await page.waitForTimeout(900);
  }
  return out;
};
