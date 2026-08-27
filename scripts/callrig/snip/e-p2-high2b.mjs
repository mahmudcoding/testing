import {WS, BASE} from './e-p2-helpers.mjs';
const rsvp = () => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  const m=document.querySelector('main')||document.body;
  const btns=[...m.querySelectorAll('button')].filter(vis)
    .filter(e=>/^(Yes|No|Maybe)$/.test((e.textContent||'').trim()))
    .map(e=>({t:(e.textContent||'').trim(),
      disabled:e.disabled===true||e.getAttribute('aria-disabled')==='true',
      opacity:getComputedStyle(e).opacity, pressed:e.getAttribute('aria-pressed')}));
  const t=m.innerText.replace(/\s+/g,' ');
  return {rsvpButtons:btns, hasYourResponse:/Your response/i.test(t),
    inviteByEmailEnabled: (()=>{const b=[...m.querySelectorAll('button')].filter(vis)
      .find(e=>/Invite by email/i.test(e.textContent||'')); return b? !(b.disabled): null;})(),
    head:t.slice(0,90)};
};
export default async ({page}) => {
  const out={};
  // A) by the meeting's own link — the path a notification takes you down
  await page.goto(`${BASE}/w/${WS}/calendar/S4OX2EYG6IHFZ1Q`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  out.byOwnLink = await page.evaluate(rsvp);
  // B) same meeting reached from the calendar grid, for contrast
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const clicked = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const c=[...document.querySelectorAll('button')].filter(vis)
      .find(e=>/Invite seam 2334/.test(e.textContent||''));
    if(!c) return false; c.scrollIntoView({block:'center'}); c.click(); return true;
  });
  await page.waitForTimeout(4500);
  out.fromGrid = clicked? await page.evaluate(rsvp) : {notFound:true};
  return out;
};
