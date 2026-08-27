import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const posts=[];
  page.on('request', r=>{ if(r.url().includes('/api/v1/calendar/meetings') && r.method()==='POST'){ let b=''; try{b=r.postData()||'';}catch(e){} posts.push(b); }});

  // ---- F4: recurring edit has no scope wording
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const chip=page.locator('[data-testid="calendar-event-chip"]').filter({hasText:'QA-E Daily standup'}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(700); await chip.click();
  await page.waitForTimeout(4000);
  out.F4_cardHasRepeats = await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return /Repeats/.test(d.innerText||''); })()`);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop(); return clickDeepest(d,/^Edit$/); })()`);
  await page.waitForTimeout(3500);
  out.F4_editScopeWords = await page.evaluate(`(() => { ${boxVisFn}
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(boxVis); const d=ds[ds.length-1];
    const t=(d.innerText||'');
    return 'series='+/series/i.test(t)+' occurrence='+/occurrence/i.test(t)+' thisEvent='+/this event|all events|only this/i.test(t); })()`);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);

  // ---- F9: start-date desync
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3000);
  const fields = `(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const t=(d.innerText||'').replace(/\\n+/g,' | ');
    return [...d.querySelectorAll('input')].filter(i=>/event-(start|end)/.test(i.getAttribute('data-field')||''))
      .map(i=>i.getAttribute('data-field').replace('event-','')+'='+i.value).join(' ')
      + ' || summary: ' + ((t.match(/\\w{3}, \\w{3} \\d+[^|]*/)||[''])[0].trim().slice(0,44)); })()`;
  out.F9_default = await page.evaluate(fields);
  await page.locator('input[data-field="event-start"]').first().fill('2026-09-12');
  await page.waitForTimeout(1800);
  out.F9_afterStartDate = await page.evaluate(fields);

  // ---- F6: reminder value absent from the POST
  await page.locator('input[data-field="event-title"]').first().fill('QA-E reverify reminder');
  await page.locator('input[data-field="event-start"]').first().fill('2026-08-26');
  await page.waitForTimeout(500);
  await page.locator('input[data-field="event-start-time"]').first().fill('23:50');
  await page.waitForTimeout(500);
  await page.locator('input[data-field="event-end-time"]').first().fill('23:59');
  await page.waitForTimeout(900);
  await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const b=[...d.querySelectorAll('button')].find(x=>/No reminder|minutes before|hour before/i.test(x.textContent||''));
    if(b){ b.scrollIntoView({block:'center'}); } })()`);
  await page.waitForTimeout(900);
  await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const b=[...d.querySelectorAll('button')].find(x=>/No reminder|minutes before|hour before/i.test(x.textContent||''));
    if(b) b.click(); })()`);
  await page.waitForTimeout(2200);
  await page.evaluate(`(() => { ${VISFN}
    const o=[...document.querySelectorAll('[role=option]')].filter(vis).find(x=>(x.textContent||'').trim()==='30 minutes before');
    o && o.click(); })()`);
  await page.waitForTimeout(1800);
  out.F6_shown = await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const b=[...d.querySelectorAll('button')].find(x=>/No reminder|minutes before|hour before/i.test(x.textContent||''));
    return b?(b.textContent||'').trim():'gone'; })()`);
  posts.length=0;
  await page.getByRole('button',{name:'Schedule meeting', exact:true}).first().click();
  await page.waitForTimeout(6000);
  out.F6_postMentionsReminder = /remind/i.test(posts[0]||'');
  out.F6_postKeys = (()=>{ try{ return Object.keys(JSON.parse(posts[0])).join(','); }catch(e){ return '(no post)'; } })();
  return out;
};
