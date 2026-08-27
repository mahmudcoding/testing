import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVis = `const bv = el => { const r=el.getBoundingClientRect(); if(r.width<200||r.height<120) return false;
   let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
     if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const posts=[];
  page.on('request', r=>{ if(/\/api\/v1\/calendar\/meetings/.test(r.url())&&r.method()==='POST')
    posts.push((r.postData()||'').slice(0,160)); });
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3800);
  await page.evaluate(`(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     const i=d.querySelector('input[data-field="event-title"]')||d.querySelector('input[type=text]');
     const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
     s.call(i,'E2 range AB'); i.dispatchEvent(new Event('input',{bubbles:true})); })()`);
  const clickSubmit = async () => {
    const t = await page.evaluate(`(() => { ${boxVis} ${VISFN}
       const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
       const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/^Schedule meeting$/.test((x.innerText||'').trim()));
       if(!b) return null; const r=b.getBoundingClientRect();
       return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    if(!t) return {clicked:false};
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(400);
    const on = await page.evaluate(`(() => { const e=document.elementFromPoint(${t.cx},${t.cy});
       return e?{tag:e.tagName, txt:(e.innerText||'').trim().slice(0,20)}:null; })()`);
    posts.length=0;
    await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    await page.waitForTimeout(5000);
    return {clicked:true, pointerOn:on, posts:posts.slice(0,1)};
  };
  // A: INVALID range (end time before start time, same day)
  await page.locator('input[data-field="event-start-time"]').first().fill('14:00');
  await page.waitForTimeout(900);
  await page.locator('input[data-field="event-end-time"]').first().fill('09:00');
  await page.waitForTimeout(1600);
  out.A_invalid = await clickSubmit();
  out.A_state = await page.evaluate(`(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     return d?{dialogOpen:true, hasSummary:/\\d{1,2}:\\d{2}\\s*(AM|PM)?\\s*–/.test((d.innerText||'').replace(/\\s+/g,' '))}:{dialogOpen:false}; })()`);
  // B: same dialog, same button, FIX the range
  await page.locator('input[data-field="event-end-time"]').first().fill('15:00');
  await page.waitForTimeout(1800);
  out.B_valid = await clickSubmit();
  out.B_state = await page.evaluate(`(() => { ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog],aside')].filter(bv).pop();
     return d?{dialogOpen:true}:{dialogOpen:false}; })()`);
  return out;
};
