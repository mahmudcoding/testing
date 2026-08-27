import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const m=document.querySelector('main');
    const t=m.innerText.replace(/\s+/g,' ');
    // any Yes/No outside a card, i.e. inline RSVP anywhere on the calendar page
    const inlineRsvp=[...m.querySelectorAll('button')].filter(vis)
      .filter(e=>/^(Yes|No|Maybe|Accept|Decline)$/.test((e.textContent||'').trim()))
      .map(e=>{const r=e.getBoundingClientRect(); return {t:e.textContent.trim(), disabled:e.disabled, x:Math.round(r.x), y:Math.round(r.y)};});
    return {hasUpcomingWord:/Upcoming|Ближайшие|Agenda/i.test(t),
      viewControls:[...m.querySelectorAll('button')].filter(vis)
        .map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim())
        .filter(x=>/^(Day|Week|Month|Today|Upcoming|Agenda|List)$/.test(x)),
      inlineRsvpCount:inlineRsvp.length, inlineRsvp:inlineRsvp.slice(0,4),
      head:t.slice(0,110)};
  });
};
