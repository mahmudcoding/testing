import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
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
  await page.waitForTimeout(3000);
  // describe the Send invitations node precisely
  out.sendNode = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const cands=[...d.querySelectorAll('*')].filter(n=>/Send invitations/i.test(n.textContent||'')&&(n.textContent||'').length<40);
    const deepest=cands[cands.length-1];
    if(!deepest) return 'text not found';
    let n=deepest, chain=[];
    for(let i=0;i<4 && n && n!==d;i++){ const r=n.getBoundingClientRect(); const cs=getComputedStyle(n);
      chain.push('<'+n.tagName+'> disabled='+(n.disabled??'-')+' rect='+Math.round(r.width)+'x'+Math.round(r.height)
        +'@'+Math.round(r.y)+' op='+cs.opacity+' pe='+cs.pointerEvents+' vis='+vis(n)); n=n.parentElement; }
    return chain; })()`);
  // fill the email and see if it becomes enabled
  await page.locator('[role=dialog] input[type=email]').first().fill('someone@example.com');
  await page.waitForTimeout(1800);
  out.afterFill = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    const b=[...d.querySelectorAll('button')].find(x=>/Send invitations/i.test(x.textContent||''));
    return b? {found:true, disabled:b.disabled, vis:vis(b), rect:Math.round(b.getBoundingClientRect().width)+'x'+Math.round(b.getBoundingClientRect().height)+'@'+Math.round(b.getBoundingClientRect().y), op:getComputedStyle(b).opacity} : {found:false}; })()`);
  out.ctrlsNow = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return interactives(d).map(x=>x.label.slice(0,24)+(x.disabled?'[D]':'')).join(' | ').slice(0,260); })()`);
  return out;
};
