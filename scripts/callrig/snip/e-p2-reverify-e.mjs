import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<60) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  // --- Display settings panel via Cmd+Shift+T ---
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  await page.keyboard.press('Meta+Shift+t'); await page.waitForTimeout(3500);
  out.panelOpened = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog],[data-state=open],aside')].filter(boxVis).pop();
     if(!d) return {none:true};
     return { text:(d.innerText||'').replace(/\\s+/g,' ').slice(0,200),
              buttons:[...new Set([...d.querySelectorAll('button')].filter(vis)
                .map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\\s+/g,' ').trim()).filter(Boolean))].slice(0,16) }; })()`);
  const st = `(() => ({theme:document.documentElement.getAttribute('data-theme'),
     density:document.documentElement.getAttribute('data-density'),
     scale:getComputedStyle(document.documentElement).getPropertyValue('--text-body').trim()}))()`;
  out.before = await page.evaluate(st);
  const clickIn = async re => { const t=await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
      const d=[...document.querySelectorAll('[role=dialog],[data-state=open],aside')].filter(boxVis).pop();
      const b=[...d.querySelectorAll('button')].filter(vis).find(x=>${re}.test((x.textContent||'').trim()));
      if(!b) return {none:true}; const r=b.getBoundingClientRect();
      return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(t.none) return 'not found';
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(260);
    await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    await page.waitForTimeout(2500); return 'clicked'; };
  out.setDark = await clickIn('/^Dark$/');
  out.setCompact = await clickIn('/^Compact$/');
  out.afterChanges = await page.evaluate(st);
  out.resetClick = await clickIn('/^Reset all$/');
  await page.waitForTimeout(3000);
  out.afterReset = await page.evaluate(st);
  out.F10holds = out.resetClick==='clicked'
              && out.afterReset.theme==='dark'
              && out.afterReset.density!==out.afterChanges.density;
  // restore
  out.restore = await clickIn('/^System$/');
  await page.waitForTimeout(1500);
  out.restored = await page.evaluate(st);
  await page.keyboard.press('Escape');
  return out;
};
