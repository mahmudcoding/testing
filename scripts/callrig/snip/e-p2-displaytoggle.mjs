import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const state = `(() => { ${VISFN} ${boxVisFn}
  const h=document.documentElement, b=document.body;
  const cs=getComputedStyle(h);
  return {
    htmlAttrs: [...h.attributes].map(a=>a.name+'='+a.value.slice(0,26)).join(' '),
    bodyClass: String(b.className||'').slice(0,60),
    density: cs.getPropertyValue('--density-row').trim(),
    theme: cs.getPropertyValue('--ground').trim()||getComputedStyle(b).backgroundColor,
    bg: getComputedStyle(b).backgroundColor,
    dialogs: [...document.querySelectorAll('[role=dialog]')].filter(boxVis).map(d=>(d.innerText||'').split('\\n')[0].slice(0,30)),
    ls: (()=>{ try{ return Object.keys(localStorage).filter(k=>/theme|density|display|appear/i.test(k)).map(k=>k+'='+String(localStorage.getItem(k)).slice(0,20)).join(' ')||'(none matching)'; }catch(e){ return 'err'; } })()
  }; })()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.a_before = await page.evaluate(state);
  await page.keyboard.press('Meta+Shift+KeyT');
  await page.waitForTimeout(3000);
  out.b_afterShortcut = await page.evaluate(state);
  // now the button in the Help dialog
  await page.locator('button[aria-label="Help & resources"]').first().click();
  await page.waitForTimeout(2500);
  out.c_helpOpen = await page.evaluate(state);
  out.clickToggle = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /Toggle display settings/i); })()`);
  await page.waitForTimeout(3000);
  out.d_afterButton = await page.evaluate(state);
  return out;
};
