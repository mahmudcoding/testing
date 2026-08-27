import {WS, BASE} from './e-p2-helpers.mjs';
const snap = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  const side=document.querySelector('aside')||document.querySelector('nav');
  return {url:location.pathname,
    wsHeader:(side? [...side.querySelectorAll('button')].filter(vis).map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim()).find(t=>/Workspace|QA /i.test(t)) : null),
    channels:[...document.querySelectorAll('a')].filter(vis)
      .filter(a=>/\/c\//.test(a.getAttribute('href')||''))
      .map(a=>(a.textContent||'').replace(/\s+/g,' ').trim().slice(0,20)),
    railItems:[...document.querySelectorAll('a')].filter(vis)
      .map(a=>(a.getAttribute('aria-label')||a.textContent||'').trim())
      .filter(t=>/^(Chat|Calls|Calendar|Files)$/.test(t))};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const before = await page.evaluate(snap);
  await page.locator('button[aria-label="Open workspace menu"]').first().click();
  await page.waitForTimeout(2200);
  const menu = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    return [...new Set([...document.querySelectorAll('[role=menuitem],[role=menu] button,[role=dialog] button')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean))].slice(0,14);
  });
  // switch to the other workspace if it is offered
  const other = menu.find(m=>/QA E Second/i.test(m));
  let after=null, back=null;
  if (other) {
    await page.evaluate((name)=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const b=[...document.querySelectorAll('[role=menuitem],[role=menu] button,[role=dialog] button')].filter(vis)
        .find(e=>(e.textContent||'').replace(/\s+/g,' ').trim()===name); b&&b.click();
    }, other);
    await page.waitForTimeout(5000);
    after = await page.evaluate(snap);
  }
  return {before, menuItems:menu, otherWorkspace:other||null, after,
    urlChanged: after? after.url!==before.url : null};
};
