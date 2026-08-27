import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url(); const m=r.request().method();
    if(u.includes('/api/v1/')&&m!=='GET') api.push(r.status()+' '+m+' '+u.split('/api/v1/')[1].slice(0,40)+' | req='+(r.request().postData()||'').slice(0,220)); });
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const chip = page.locator('[data-testid="calendar-event-chip"]').filter({hasText:'RESCHEDULED'}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(1000);
  await chip.click(); await page.waitForTimeout(4500);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop(); clickDeepest(d, /^Edit/); })()`);
  await page.waitForTimeout(4500);
  const radios = `(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     return [...d.querySelectorAll('input[type=radio]')].map(r=>r.value+'='+r.checked+'/disabled='+r.disabled); })()`;
  out.r0 = await page.evaluate(radios);
  // click the Private radio itself, with a real mouse, at its own coordinates
  const t = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const inp=[...d.querySelectorAll('input[type=radio]')].find(r=>r.value==='private');
     // the visible control is usually the label wrapping it
     const lab=inp.closest('label')||inp.parentElement;
     const r=(lab.getBoundingClientRect().width>4?lab:inp).getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2), w:Math.round(r.width), h:Math.round(r.height)}; })()`);
  out.target=t;
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
  await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
  await page.waitForTimeout(2000);
  out.r1_afterMouse = await page.evaluate(radios);
  out.dialogText = await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const t=(d.innerText||'').replace(/\\s+/g,' '); const i=t.indexOf('MEETING ACCESS');
     return t.slice(i, i+200); })()`);
  api.length=0;
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop(); clickDeepest(d, /^Save$/); })()`);
  await page.waitForTimeout(9000);
  out.saveReq = api.slice(0,2);
  return out;
};
