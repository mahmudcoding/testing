import {WS, BASE} from './e-p2-helpers.mjs';
const snap = () => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  const m=document.querySelector('main')||document.body;
  const inp=[...m.querySelectorAll('input')].filter(vis)[0];
  const tabs=[...m.querySelectorAll('button')].filter(vis).filter(e=>/^(People|Channels)$/.test((e.textContent||'').trim()))
    .map(e=>({n:e.textContent.trim(), sel:e.getAttribute('aria-selected')}));
  return {query: inp? inp.value : null, tabs,
    people:[...new Set([...m.querySelectorAll('button')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||'')).filter(x=>/^Open .*'s profile$/.test(x))
      .map(x=>x.replace(/^Open (.*)'s profile$/,'$1')))],
    channels:[...m.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0)
      .map(e=>(e.textContent||'').trim()).filter(t=>/^(qa|e)-[a-z0-9-]+$/.test(t)),
    text: m.innerText.replace(/\s+/g,' ').slice(0,160)};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const out={};
  const inp=page.locator('main input').first();
  await inp.click(); await inp.type('qa-empty',{delay:50});
  await page.waitForTimeout(2500);
  out.peopleTab_channelQuery = await page.evaluate(snap);
  // switch to Channels WITHOUT retyping
  await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const t=[...document.querySelectorAll('button')].filter(vis).find(e=>(e.textContent||'').trim()==='Channels');
    t&&t.click();
  });
  await page.waitForTimeout(2500);
  out.channelsTab_sameQuery = await page.evaluate(snap);
  return out;
};
