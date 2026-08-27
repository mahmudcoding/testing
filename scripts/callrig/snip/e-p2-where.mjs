import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url(); const m=r.request().method();
    if(u.includes('/api/v1/calendar/meetings')&&m!=='GET'){ let b=''; try{b=(await r.text()).slice(0,120);}catch(e){}
      api.push(r.status()+' '+m+' | req='+(r.request().postData()||'').slice(0,260)); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3500);
  await page.locator('input[data-field="event-title"]').first().fill('QA-E Where probe');
  await page.locator('input[data-field="event-start"]').first().fill('2026-08-28');
  await page.waitForTimeout(400);
  await page.locator('input[data-field="event-start-time"]').first().fill('11:00');
  await page.waitForTimeout(400);
  await page.locator('input[data-field="event-end"]').first().fill('2026-08-28');
  await page.waitForTimeout(400);
  await page.locator('input[data-field="event-end-time"]').first().fill('11:30');
  await page.waitForTimeout(800);
  // Where options
  out.whereOpts = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const t=(d.innerText||'').replace(/\\s+/g,' '); const i=t.indexOf('Where');
     return t.slice(i, i+240); })()`);
  // click "External link" with a real mouse
  const t = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const cands=[...d.querySelectorAll('button,label,[role=radio]')].filter(vis)
       .filter(x=>/External link/i.test(x.textContent||''));
     const inner=cands.filter(c=>!cands.some(o=>o!==c&&c.contains(o)));
     const el=inner[0]||cands[0]; if(!el) return {none:true};
     const r=el.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.extTarget=t;
  if(!t.none){ await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
    await page.waitForTimeout(2500); }
  out.afterPick = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     return {inputs:[...d.querySelectorAll('input')].filter(vis)
        .map(i=>'df='+(i.getAttribute('data-field')||'-')+' type='+(i.getAttribute('type')||'-')
             +' ph="'+((i.getAttribute('placeholder')||'').slice(0,30))+'" val="'+String(i.value||'').slice(0,16)+'"').slice(0,10)}; })()`);
  return out;
};
