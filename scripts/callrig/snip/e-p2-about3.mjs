import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/settings/about`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const m=document.querySelector('main');
    const t=m.innerText.replace(/\s+/g,' ');
    const i=t.indexOf('›'); const body=i>=0?t.slice(i+1):t;
    // enumerate EVERYTHING interactive in the content column, no text filter
    const nav=[...m.querySelectorAll('a[href*="/settings/"]')];
    const inContent=e=>!nav.some(n=>n.contains(e));
    const ctrls=[...m.querySelectorAll('button,a,input,[role=switch],[role=button]')].filter(e=>vis(e)&&inContent(e))
      .map(e=>({tag:e.tagName, l:(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,34),
                href:e.getAttribute('href')||null, type:e.type||null}));
    return {bodyFullLength: body.length, bodyFull: body.trim(),
      contentControls: ctrls,
      mentionsLicence: /licen[cs]e|лиценз/i.test(body),
      mentionsHelp: /help|support|contact|поддерж/i.test(body),
      scrollHeight: m.scrollHeight, clientHeight: m.clientHeight};
  });
};
