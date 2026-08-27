import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const OPT=process.env.QA_OPT||'15 minutes before';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('request', r=>{ const u=r.url();
    if (u.includes('/api/v1/calendar/meetings') && r.method()==='POST') {
      let b=''; try{ b=r.postData()||''; }catch(e){}
      reqs.push(b); } });
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3000);
  await page.locator('input[data-field="event-title"]').first().fill('QA-E Rem payload3');
  await page.locator('input[data-field="event-start-time"]').first().fill('23:20');
  await page.waitForTimeout(600);
  await page.locator('input[data-field="event-end-time"]').first().fill('23:35');
  await page.waitForTimeout(1200);
  // open the listbox and wait for options to actually render
  await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const b=[...d.querySelectorAll('button')].find(x=>/No reminder|minutes before|hour before/i.test(x.textContent||''));
    b && b.scrollIntoView({block:'center'}); })()`);
  await page.waitForTimeout(900);
  await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const b=[...d.querySelectorAll('button')].find(x=>/No reminder|minutes before|hour before/i.test(x.textContent||''));
    b && b.click(); })()`);
  for (let i=0;i<12;i++){ await page.waitForTimeout(500);
    const n = await page.evaluate(`(() => { ${VISFN} return [...document.querySelectorAll('[role=option]')].filter(vis).length; })()`);
    if (n>0) { out.optionsAppearedAfterMs = (i+1)*500; break; } }
  out.options = await page.evaluate(`(() => { ${VISFN} return [...document.querySelectorAll('[role=option]')].filter(vis).map(o=>(o.textContent||'').trim()); })()`);
  out.picked = await page.evaluate(`(() => { ${VISFN}
    const o=[...document.querySelectorAll('[role=option]')].filter(vis).find(x=>(x.textContent||'').trim()===${JSON.stringify(OPT)});
    if(!o) return 'not found'; o.click(); return 'clicked'; })()`);
  await page.waitForTimeout(2000);
  out.shownValue = await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const b=[...d.querySelectorAll('button')].find(x=>/No reminder|minutes before|hour before/i.test(x.textContent||''));
    return b?(b.textContent||'').trim():'gone'; })()`);
  await page.keyboard.press('Escape');   // close the listbox popover if it is still open
  await page.waitForTimeout(1200);
  out.dialogStillOpen = await page.evaluate(`(() => { ${boxVisFn} return [...document.querySelectorAll('[role=dialog]')].filter(boxVis).length; })()`);
  reqs.length=0;
  try { await page.getByRole('button',{name:'Schedule meeting', exact:true}).first().click({timeout:9000}); out.submit='clicked'; }
  catch(e){ out.submit='ERR '+String(e).replace(/\s+/g,' ').slice(0,90); }
  await page.waitForTimeout(7000);
  out.dialogAfter = await page.evaluate(`(() => { ${boxVisFn} return [...document.querySelectorAll('[role=dialog]')].filter(boxVis).length; })()`);
  out.postBody = reqs[0]||'(no POST captured)';
  out.mentionsReminder = /remind/i.test(out.postBody);
  return out;
};
