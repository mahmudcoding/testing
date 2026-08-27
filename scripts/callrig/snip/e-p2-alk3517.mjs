import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const CAROL='U4QECAROL000001';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const posts=[];
  page.on('response', async r => { if(r.url().includes('/api/v1/calendar/meetings')&&r.request().method()==='POST'){
    let b=''; try{b=(await r.text()).slice(0,120);}catch(e){}
    posts.push({st:r.status, req:(r.request().postData()||'').slice(0,240), res:b}); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  out.block = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/messaging/users/block',{method:'POST',credentials:'include',
       headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:'${CAROL}'})});
     const b=await fetch('/api/v1/messaging/users/blocked',{credentials:'include'});
     const t=await b.text(); return {st:r.status, confirmed:/CAROL/i.test(t)}; })()`);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3400);
  await page.locator('input[data-field="event-title"]').first().fill('QA-E blocked invite probe');
  await page.locator('input[data-field="event-start"]').first().fill('2026-09-24'); await page.waitForTimeout(300);
  await page.locator('input[data-field="event-start-time"]').first().fill('11:00'); await page.waitForTimeout(300);
  await page.locator('input[data-field="event-end"]').first().fill('2026-09-24'); await page.waitForTimeout(300);
  await page.locator('input[data-field="event-end-time"]').first().fill('11:30'); await page.waitForTimeout(700);
  const sm=page.locator('input[placeholder="Search members"]').first();
  await sm.scrollIntoViewIfNeeded(); await sm.fill('Carol');
  await page.waitForTimeout(2600);
  out.pickerShowsBlocked = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const opts=[...d.querySelectorAll('button,[role=option],li')].filter(vis)
       .filter(x=>/QA Carol/.test(x.textContent||''));
     const inner=opts.filter(c=>!opts.some(o=>o!==c&&c.contains(o)));
     return inner.map(e=>({txt:(e.textContent||'').replace(/\\s+/g,' ').trim().slice(0,34),
        disabled:e.disabled===true, aria:e.getAttribute('aria-disabled')||'-'})); })()`);
  out.pick = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     return clickDeepest(d, /QA Carol/); })()`);
  await page.waitForTimeout(2200);
  posts.length=0;
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     clickDeepest(d, /^Schedule meeting$/); })()`);
  await page.waitForTimeout(8000);
  out.post = posts[0]? {st:posts[0].st, sentCarol:/CAROL/i.test(posts[0].req),
                        attendees:(posts[0].req.match(/"attendee_user_ids":\[[^\]]*\]/)||['(none)'])[0]} : '(no POST)';
  out.unblock = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/messaging/users/unblock',{method:'POST',credentials:'include',
       headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:'${CAROL}'})});
     return r.status; })()`);
  return out;
};
