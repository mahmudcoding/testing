import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<200||r.height<120) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const mouseClick = async (page, loc) => {
  await loc.scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
  const b = await loc.boundingBox(); if(!b) return false;
  await page.mouse.move(b.x+b.width/2, b.y+b.height/2); await page.waitForTimeout(220);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
  return true;
};
export default async ({page}) => {
  const out={}; const posts=[];
  page.on('request', r=>{ const u=r.url();
    if(/\/api\/v1\/calendar\/meetings/.test(u) && /POST|PATCH|PUT/.test(r.method())){
      posts.push(r.method()+' '+u.split('/api/v1/')[1].slice(0,60)+' :: '+((r.postData()||'').slice(0,700))); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3800);
  await page.evaluate(`(() => { ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     const i=d.querySelector('input[data-field="event-title"]')||d.querySelector('input[type=text]');
     if(i){const s=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
       s.call(i,'E2 reminder wire check'); i.dispatchEvent(new Event('input',{bubbles:true}));} })()`);
  await page.waitForTimeout(1000);

  const rem = page.locator('button[role="combobox"][aria-label="Reminder"]').last();
  out.remBefore = (await rem.textContent()).trim();
  out.opened = await mouseClick(page, rem);
  await page.waitForTimeout(2000);
  out.opts = await page.evaluate(`(() => { ${VISFN}
     return [...document.querySelectorAll('[role=option],[role=menuitem],[role=menuitemradio]')].filter(vis)
       .map(x=>(x.textContent||'').trim().slice(0,26)).slice(0,12); })()`);
  const opt = page.locator('[role=option],[role=menuitem],[role=menuitemradio]')
    .filter({hasText:/^\s*(10 minutes|15 minutes|30 minutes|1 hour)/}).first();
  out.picked = (await opt.count()) ? await mouseClick(page, opt) : false;
  await page.waitForTimeout(2200);
  out.remAfter = (await rem.textContent()).trim();

  posts.length = 0;
  const sub = page.locator('button').filter({hasText:/^Schedule meeting$/}).last();
  out.submitted = await mouseClick(page, sub);
  await page.waitForTimeout(8000);
  out.wire = posts.slice(0,2);
  out.reminderChanged = out.remAfter !== out.remBefore;
  out.wireHasReminder = /remind/i.test(posts.join(' '));
  return out;
};
