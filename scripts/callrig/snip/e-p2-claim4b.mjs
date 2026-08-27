import {WS, BASE} from './e-p2-helpers.mjs';
const cards = () => {
  const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
  const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis);
  return {n:ds.length, texts:ds.map(d=>d.innerText.replace(/\s+/g,' ').slice(0,110))};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const chips = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return [...document.querySelectorAll('button')].filter(vis)
      .map(e=>(e.textContent||'').replace(/\s+/g,' ').trim())
      .filter(t=>/standup|Daily|QA-E|E2 /i.test(t)).slice(0,8);
  });
  const before = await page.evaluate(cards);
  const clicked = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const c=[...document.querySelectorAll('button')].filter(vis).find(e=>/standup/i.test(e.textContent||''));
    if(!c) return null; c.scrollIntoView({block:'center'}); c.click();
    return (c.textContent||'').replace(/\s+/g,' ').trim().slice(0,40);
  });
  await page.waitForTimeout(4500);
  const after = await page.evaluate(cards);
  return {chipsOnScreen:chips, clicked, before, after};
};
