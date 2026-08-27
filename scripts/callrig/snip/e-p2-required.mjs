import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3400);
  const sm=page.locator('input[placeholder="Search members"]').first();
  await sm.scrollIntoViewIfNeeded(); await sm.fill('Bob');
  await page.waitForTimeout(2400);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     clickDeepest(d, /QA Bob/); })()`);
  await page.waitForTimeout(2200);
  // does the form offer Required / optional at all?
  out.selectedArea = await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     const i=t.indexOf('Selected');
     return t.slice(Math.max(0,i-30), i+180); })()`);
  out.attendeeControls = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     return [...new Set([...d.querySelectorAll('button,[role=switch],select,[role=radio]')].filter(vis)
       .map(b=>((b.getAttribute('aria-label')||b.textContent||'').replace(/\\s+/g,' ').trim()))
       .filter(x=>/requir|option|обязат|необязат|QA Bob/i.test(x)))].slice(0,8); })()`);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     const d=[...document.querySelectorAll('[role=alertdialog],[role=dialog]')].filter(e=>e.getBoundingClientRect().width>80).pop();
     if(d) clickDeepest(d, /^(Discard|Yes|Close)$/); })()`);
  // and what an existing meeting's attendees look like on the card
  await page.waitForTimeout(1500);
  out.existingCard = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/calendar/meetings/S4OWSESS9KOG8BT',{credentials:'include'});
     const t=await r.text(); let d=null; try{d=JSON.parse(t);}catch(e){return t.slice(0,100);}
     return (d.attendees||[]).map(a=>({role:a.role??a.type??'(no role field)', status:a.rsvp_status,
        keys:Object.keys(a).join(',').slice(0,90)})); })()`);
  return out;
};
