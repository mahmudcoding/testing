import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.htmlTheme = await page.evaluate(`(() => document.documentElement.getAttribute('data-theme'))()`);
  out.prefersDark = await page.evaluate(`(() => matchMedia('(prefers-color-scheme: dark)').matches)()`);
  await page.keyboard.press('Meta+Shift+KeyT');
  await page.waitForTimeout(2500);
  out.themeButtons = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const p=[...document.querySelectorAll('aside,[role=dialog]')].filter(boxVis).filter(e=>/Display settings/i.test(e.innerText||''))[0];
    if(!p) return 'no panel';
    return [...p.querySelectorAll('button')].filter(vis).filter(b=>/^(Light|Dark|System|Compact|Cozy)$/.test((b.textContent||'').trim()))
      .map(b=>{const cs=getComputedStyle(b);
        return (b.textContent||'').trim()+' pressed='+(b.getAttribute('aria-pressed')??'-')
          +' checked='+(b.getAttribute('aria-checked')??'-')+' state='+(b.getAttribute('data-state')||'-')
          +' cls='+String(b.className||'').split(' ').filter(c=>/bg-|border-accent|ring|text-accent/.test(c)).join('.').slice(0,42);}); })()`);
  return out;
};
