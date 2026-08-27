import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const hunt = `(() => { ${VISFN} ${boxVisFn}
  const re=/remind|notify|alert|напомин|before the meeting|minutes before/i;
  const hits=[...document.querySelectorAll('*')].filter(n=>n.children.length===0&&re.test(n.textContent||''))
    .map(n=>(n.textContent||'').replace(/\\s+/g,' ').trim().slice(0,60)+(vis(n)?' [VIS]':' [hidden]'));
  return [...new Set(hits)].slice(0,10); })()`;
export default async ({page}) => {
  const out={};
  // 1. create dialog, with Meeting settings expanded
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await page.getByRole('button',{name:'New meeting'}).first().click();
  await page.waitForTimeout(3000);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /^Meeting settings$/); })()`);
  await page.waitForTimeout(2200);
  out.createDialog = await page.evaluate(hunt);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  // 2. a meeting card
  const chip=page.locator('[data-testid="calendar-event-chip"]').first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(700); await chip.click();
  await page.waitForTimeout(3500);
  out.meetingCard = await page.evaluate(hunt);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  // 3. notification settings page (sector D's, but reminders are listed in MY scope)
  await page.goto(BASE+'/w/'+WS+'/settings/notifications', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  out.notificationSettings = await page.evaluate(hunt);
  out.notifSettingsCtrls = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main')||document.body;
    return interactives(m).map(x=>x.label.slice(0,26)).join(' | ').slice(0,420); })()`);
  return out;
};
