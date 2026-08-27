import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const posts=[];
  page.on('response', r => { if(r.url().includes('/api/v1/calendar/meetings')&&r.request().method()==='POST')
    posts.push({req:(r.request().postData()||''), st:r.status()}); });
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3400);
  await page.locator('input[data-field="event-title"]').first().fill('QA-E F6 recheck');
  await page.locator('input[data-field="event-start"]').first().fill('2026-09-21'); await page.waitForTimeout(350);
  await page.locator('input[data-field="event-start-time"]').first().fill('11:00'); await page.waitForTimeout(350);
  await page.locator('input[data-field="event-end"]').first().fill('2026-09-21'); await page.waitForTimeout(350);
  await page.locator('input[data-field="event-end-time"]').first().fill('11:30'); await page.waitForTimeout(900);
  const spanTxt = `(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const e=[...d.querySelectorAll('span')].filter(x=>/^(No reminder|\\d+ minutes? before|1 hour before)$/.test((x.textContent||'').trim()))[0];
     return e? (e.textContent||'').trim():'(not found)'; })()`;
  await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const e=[...d.querySelectorAll('span')].filter(x=>/^No reminder$/.test((x.textContent||'').trim()))[0];
     if(e) e.scrollIntoView({block:'center'}); })()`);
  await page.waitForTimeout(1300);
  const box = await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const e=[...d.querySelectorAll('span')].filter(x=>/^No reminder$/.test((x.textContent||'').trim()))[0];
     const t=e.closest('button'); const r=t.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  await page.mouse.move(box.cx,box.cy); await page.waitForTimeout(350);
  await page.mouse.down(); await page.waitForTimeout(140); await page.mouse.up();
  await page.waitForTimeout(2800);
  const opt = await page.evaluate(`(() => { ${VISFN}
     const els=[...document.querySelectorAll('*')].filter(vis).filter(x=>/^15 minutes before$/.test((x.textContent||'').trim()));
     const inner=els.filter(c=>!els.some(o=>o!==c&&c.contains(o)));
     const r=inner[0].getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  await page.mouse.move(opt.cx,opt.cy); await page.waitForTimeout(300);
  await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
  await page.waitForTimeout(2500);
  out.shownValue = await page.evaluate(spanTxt);
  posts.length=0;
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     clickDeepest(d, /^Schedule meeting$/); })()`);
  await page.waitForTimeout(8000);
  const p = posts[0];
  out.request = p? p.req.slice(0,420):'(no POST)';
  out.bodyKeys = p? Object.keys(JSON.parse(p.req)).join(','):null;
  out.reminderKeyPresent = out.bodyKeys? /remind|notify|alert|offset/i.test(out.bodyKeys):null;
  out.holds = out.shownValue==='15 minutes before' && out.reminderKeyPresent===false;
  return out;
};
