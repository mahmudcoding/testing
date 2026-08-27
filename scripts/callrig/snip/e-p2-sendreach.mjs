import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const probe = `(() => { ${VISFN} ${boxVisFn}
  const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  const b=[...d.querySelectorAll('button')].find(x=>/Send invitations/i.test(x.textContent||''));
  if(!b) return 'absent';
  const r=b.getBoundingClientRect();
  return 'disabled='+b.disabled+' vis='+vis(b)+' y='+Math.round(r.y)+' innerH='+innerHeight
    +' inViewport='+(r.y>=0&&r.y<innerHeight); })()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const chip=page.locator('[data-testid="calendar-event-chip"]').filter({hasText:'QA-E RSVP three'}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(700); await chip.click();
  await page.waitForTimeout(4000);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /^Invite by email$/); })()`);
  await page.waitForTimeout(2800);
  out.a_empty = await page.evaluate(probe);
  await page.locator('[role=dialog] input[type=email]').first().fill('not-an-email');
  await page.waitForTimeout(1800);
  out.b_invalidEmail = await page.evaluate(probe);
  await page.locator('[role=dialog] input[type=email]').first().fill('someone@example.com');
  await page.waitForTimeout(1800);
  out.c_validEmail = await page.evaluate(probe);
  // scroll it into view WITHOUT clicking it
  out.scrolled = await page.evaluate(`(() => { ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const b=[...d.querySelectorAll('button')].find(x=>/Send invitations/i.test(x.textContent||''));
    if(!b) return 'absent'; b.scrollIntoView({block:'center'}); return 'scrolled'; })()`);
  await page.waitForTimeout(1500);
  out.d_afterScroll = await page.evaluate(probe);
  // leave without sending
  await page.keyboard.press('Escape');
  return out;
};
