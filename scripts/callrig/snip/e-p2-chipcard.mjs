import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const NAME = process.env.QA_CHIP || 'QA-E Sync 1 renamed';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return j?.email||'?';})()`);
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const chip = page.locator('[data-testid="calendar-event-chip"]').filter({hasText: NAME}).first();
  out.chipCount = await page.locator('[data-testid="calendar-event-chip"]').filter({hasText: NAME}).count();
  await chip.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await chip.click();
  await page.waitForTimeout(5000);
  out.url = page.url().replace(/^https:\/\/[^/]+/,'');
  out.card = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    if(!d) return {noCard:true};
    const btns=[...d.querySelectorAll('button')].filter(b=>vis(b));
    return { text:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,320),
      btns: btns.map(b=>{const cs=getComputedStyle(b);
        return (b.textContent||b.getAttribute('aria-label')||'').trim().slice(0,16)+(b.disabled?'[DIS]':'[en]')+'op'+cs.opacity;}).join(' | ').slice(0,400) }; })()`);
  return out;
};
