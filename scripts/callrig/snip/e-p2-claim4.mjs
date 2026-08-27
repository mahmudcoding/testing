import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  // CLAIM (finding 4): deleting a recurring occurrence DOES say it removes only that one
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const opened = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const c=[...document.querySelectorAll('button')].filter(vis)
      .find(e=>/standup|Daily/i.test(e.textContent||''));
    if(!c) return null; const t=(c.textContent||'').replace(/\s+/g,' ').trim().slice(0,40);
    c.scrollIntoView({block:'center'}); c.click(); return t;
  });
  await page.waitForTimeout(4000);
  const card = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis);
    const d=ds[ds.length-1];
    if(!d) return {noCard:true};
    return {text:d.innerText.replace(/\s+/g,' ').slice(0,150),
      buttons:[...d.querySelectorAll('button')].filter(vis).map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,22)).filter(Boolean)};
  });
  // open the delete confirmation WITHOUT confirming
  const del = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis);
    const d=ds[ds.length-1];
    const b=[...d.querySelectorAll('button')].filter(vis).find(e=>/^Delete|Удалить/i.test((e.getAttribute('aria-label')||e.textContent||'').trim()));
    if(!b) return null; b.click(); return (b.getAttribute('aria-label')||b.textContent||'').trim();
  });
  await page.waitForTimeout(2500);
  const confirm = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis);
    const d=ds[ds.length-1];
    return d? {text:d.innerText.replace(/\s+/g,' ').slice(0,220),
      mentionsOccurrence:/occurrence|вхожден|series|серии/i.test(d.innerText)} : {none:true};
  });
  return {chip:opened, card, deleteControl:del, confirmDialog:confirm};
};
