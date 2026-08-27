import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(u.includes('/api/v1/')&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,220);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,52)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const chip=page.locator('[data-testid="calendar-event-chip"]').filter({hasText:'QA-E RSVP three'}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(700); await chip.click();
  await page.waitForTimeout(4000);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /^Invite by email$/); })()`);
  await page.waitForTimeout(2800);
  // ONLY a syntactically invalid address — cannot be delivered to anyone
  await page.locator('[role=dialog] input[type=email]').first().fill('not-an-email');
  await page.waitForTimeout(1500);
  await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const b=[...d.querySelectorAll('button')].find(x=>/Send invitations/i.test(x.textContent||''));
    b && b.scrollIntoView({block:'center'}); })()`);
  await page.waitForTimeout(1200);
  writes.length=0;
  out.click = await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const b=[...d.querySelectorAll('button')].find(x=>/Send invitations/i.test(x.textContent||''));
    if(!b) return 'absent'; b.click(); return 'clicked'; })()`);
  await page.waitForTimeout(5500);
  out.writes = writes.slice(0,3);
  out.after = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    if(!d) return 'dialog closed';
    const t=(d.innerText||'').replace(/\\n+/g,' | ');
    return {err:(t.match(/[^|]*(invalid|valid|error|required|correct)[^|]*/i)||[''])[0].trim().slice(0,90),
      stillHasForm: /Send invitations/.test(t), tail: t.slice(-140)}; })()`);
  return out;
};
