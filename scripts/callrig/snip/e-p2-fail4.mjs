import {WS, BASE} from './e-p2-helpers.mjs';
const ids = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  return [...document.querySelectorAll('button,a,[role]')].filter(vis)
    .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,40));
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const before = await page.evaluate(ids);
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(3000);
  const after = await page.evaluate(ids);
  const b=new Set(before);
  const appeared=after.filter(x=>!b.has(x));
  // and identify the container that holds them
  const container = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const mark=[...document.querySelectorAll('button')].filter(vis)
      .find(e=>/Mark all as read/i.test(e.textContent||''));
    if(!mark) return {found:false};
    let n=mark, path=[];
    for(let i=0;i<6&&n;i++){ path.push(n.tagName.toLowerCase()+(n.getAttribute('role')?`[role=${n.getAttribute('role')}]`:'')+(n.getAttribute('data-state')?`[data-state]`:'')); n=n.parentElement; }
    return {found:true, chain:path.join(' < ')};
  });
  return {appearedCount:appeared.length, appeared:appeared.slice(0,18), container};
};
