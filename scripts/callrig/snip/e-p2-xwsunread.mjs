import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const W2='W4OWJSPNXQJYZ5R';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  // sit in workspace 2
  await page.goto(BASE+'/w/'+W2+'/c/C4OWNDZ90KJ4RNM', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  out.inWs2 = await page.evaluate(`(() => { ${VISFN}
    return { wsHeader: (()=>{const b=[...document.querySelectorAll('button')].find(b=>vis(b)&&/workspace menu/i.test(b.getAttribute('aria-label')||'')); return b?(b.parentElement?.innerText||'').replace(/\\n+/g,'/').slice(0,34):null;})(),
      rail: [...document.querySelectorAll('button')].filter(b=>vis(b)&&b.getBoundingClientRect().left<62).map(b=>(b.getAttribute('aria-label')||'').slice(0,34)).join(' | '),
      channels: [...document.querySelectorAll('a[href*="/c/"]')].filter(vis).map(a=>(a.textContent||'').replace(/\\s+/g,' ').trim().slice(0,26)) }; })()`);
  // open the workspace switcher — any badge for the other workspace?
  await page.locator('button[aria-label="Open workspace menu"]').first().click();
  await page.waitForTimeout(2200);
  out.switcherMenu = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const boxes=[...document.querySelectorAll('[role=menu],[role=dialog],[data-radix-popper-content-wrapper]')].filter(boxVis);
    const p=boxes[boxes.length-1];
    if(!p) return 'no menu';
    return {text:(p.innerText||'').replace(/\\n+/g,' | ').slice(0,240),
      digitsOrDots: [...p.querySelectorAll('*')].filter(n=>n.children.length===0&&/^\\d+$/.test((n.textContent||'').trim())).map(n=>n.textContent.trim())}; })()`);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1000);
  out.unreadApiForWs1 = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/workspaces/${WS}/unread',{credentials:'include'});
    const t=await r.text(); return {s:r.status, body:t.slice(0,220)}; })()`);
  return out;
};
