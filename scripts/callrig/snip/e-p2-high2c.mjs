import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/calendar/S4OX2EYG6IHFZ1Q`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const bodyText=document.body.innerText.replace(/\s+/g,' ');
    // where does the meeting title appear at all?
    const hits=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0
      && /Invite seam 2334/.test(e.textContent||''))
      .map(e=>{const r=e.getBoundingClientRect(); return {tag:e.tagName, x:Math.round(r.x), y:Math.round(r.y)};});
    return {url:location.pathname,
      titleOnPage:/Invite seam 2334/.test(bodyText), titleNodes:hits.slice(0,4),
      yesNoAnywhere:[...document.querySelectorAll('button')].filter(vis)
        .filter(e=>/^(Yes|No)$/.test((e.textContent||'').trim()))
        .map(e=>({t:e.textContent.trim(), disabled:e.disabled, x:Math.round(e.getBoundingClientRect().x)})),
      dialogs:[...document.querySelectorAll('[role=dialog]')].filter(vis).length,
      asides:[...document.querySelectorAll('aside')].filter(vis).length,
      bodyStart:bodyText.slice(0,200)};
  });
};
