import {WS, BASE} from './e-p2-helpers.mjs';
const section = (headText) => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  const m=document.querySelector('main');
  const h=[...m.querySelectorAll('h2,h3')].filter(vis).find(e=>(e.textContent||'').trim()===headText);
  if(!h) return {notFound:true};
  // the section = heading's parent block, walked up until it holds a control
  let box=h; for(let i=0;i<6&&box;i++){ if(box.querySelectorAll('button,input,select,a').length>=1) break; box=box.parentElement; }
  return {heading:headText,
    text:box.innerText.replace(/\s+/g,' ').slice(0,240),
    controls:[...box.querySelectorAll('button,input,select,a')].filter(vis)
      .map(e=>({t:e.tagName.toLowerCase()+(e.type?`[${e.type}]`:''),
        l:(e.getAttribute('aria-label')||e.placeholder||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,28)}))};
};
export default async ({page}) => {
  const out={};
  await page.goto(`${BASE}/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.regionLanguage = await page.evaluate(section, 'Region & language');
  await page.goto(`${BASE}/w/${WS}/settings/privacy`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.loginSecurity = await page.evaluate(section, 'Login security');
  return out;
};
