import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const W2='W4OWJSPNXQJYZ5R';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const state = `(() => { ${VISFN} ${boxVisFn}
  return { url: location.pathname,
    wsName: (()=>{const b=[...document.querySelectorAll('button')].find(b=>vis(b)&&/workspace menu/i.test(b.getAttribute('aria-label')||'')); return b?(b.parentElement?.innerText||'').replace(/\\n+/g,'/').slice(0,40):null;})(),
    channels: [...document.querySelectorAll('a[href*="/c/"]')].filter(vis).map(a=>(a.textContent||'').replace(/\\s+/g,' ').trim().slice(0,26)).join(' | '),
    searchLabel: (()=>{const b=[...document.querySelectorAll('button')].find(b=>vis(b)&&/^Search /i.test(b.getAttribute('aria-label')||'')); return b?b.getAttribute('aria-label'):null;})(),
    rail: [...document.querySelectorAll('button')].filter(b=>vis(b)&&b.getBoundingClientRect().left<60).map(b=>(b.getAttribute('aria-label')||'').slice(0,30)).join(' | '),
    main: (document.querySelector('main')?.innerText||'').replace(/\\n+/g,' | ').slice(0,220) };
})()`;
const menu = `(() => { ${VISFN} ${boxVisFn}
  const boxes=[...document.querySelectorAll('[role=menu],[role=dialog],[data-radix-popper-content-wrapper]')].filter(boxVis);
  const p=boxes[boxes.length-1];
  return p? {text:(p.innerText||'').replace(/\\n+/g,' | ').slice(0,350), items: interactives(p).map(d=>d.label.slice(0,30)).join(' | ')} : {none:true};
})()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.s1_inWs1 = await page.evaluate(state);
  await page.locator('button[aria-label="Open workspace menu"]').first().click();
  await page.waitForTimeout(2000);
  out.s2_menuFromWs1 = await page.evaluate(menu);
  // switch to the second workspace
  await page.evaluate(`(() => { ${VISFN}
    const n=[...document.querySelectorAll('button,[role=menuitem],a')].find(x=>vis(x)&&/QA E Second/i.test(x.textContent||'')); n&&n.click(); })()`);
  await page.waitForTimeout(6000);
  out.s3_afterSwitch = await page.evaluate(state);
  await page.locator('button[aria-label="Open workspace menu"]').first().click();
  await page.waitForTimeout(2000);
  out.s4_menuFromWs2 = await page.evaluate(menu);
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  // reload while in ws2 — does it stay?
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(5500);
  out.s5_afterReload = await page.evaluate(state);
  // go to bare root — which workspace loads?
  await page.goto(BASE+'/', {waitUntil:'domcontentloaded'}); await page.waitForTimeout(6000);
  out.s6_root = await page.evaluate(state);
  return out;
};
