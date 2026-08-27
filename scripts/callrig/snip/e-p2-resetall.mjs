import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const st = `(() => { ${VISFN} ${boxVisFn}
  const h=document.documentElement;
  const p=[...document.querySelectorAll('aside,[role=dialog]')].filter(boxVis).filter(e=>/Display settings/i.test(e.innerText||''))[0];
  const sel = p? [...p.querySelectorAll('button')].filter(vis)
      .filter(b=>b.getAttribute('aria-checked')==='true'||b.getAttribute('aria-pressed')==='true')
      .map(b=>(b.textContent||'').trim().slice(0,14)) : [];
  return {attrs:[...h.attributes].filter(a=>/^data-(theme|density|animations|sidebar|rail)/.test(a.name)).map(a=>a.name.replace('data-','')+'='+a.value).join(' '),
    fontScale:getComputedStyle(h).fontSize, selected: sel}; })()`;
export default async ({page}) => {
  const out={};
  const open = async () => { await page.keyboard.press('Meta+Shift+KeyT'); await page.waitForTimeout(2200); };
  const pick = async (label) => await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const p=[...document.querySelectorAll('aside,[role=dialog]')].filter(boxVis).filter(e=>/Display settings/i.test(e.innerText||''))[0];
    return p? clickDeepest(p, new RegExp('^'+${JSON.stringify('LBL')}+'$')) : 'no panel'; })()`.replace('"LBL"', JSON.stringify(label)));
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  await open();
  out.a_start = await page.evaluate(st);
  for (const l of ['Light','Compact','Large']) { await pick(l); await page.waitForTimeout(1800); }
  out.b_changed = await page.evaluate(st);
  for (const l of ['Dark','Extra large']) { await pick(l); await page.waitForTimeout(1800); }
  out.c_moreChanged = await page.evaluate(st);
  out.resetClick = await pick('Reset all');
  await page.waitForTimeout(3000);
  out.d_afterResetAll = await page.evaluate(st);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(6500);
  await open();
  out.e_afterReload = await page.evaluate(st);
  return out;
};
