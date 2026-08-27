import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.locator('button[aria-label="Open archived channels"]').click();
  await page.waitForTimeout(2500);
  const panel = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    // find the panel by its heading, then walk to a container that holds the rows
    const h=[...document.querySelectorAll('h1,h2,h3')].filter(vis).find(e=>/Archived channels/i.test(e.textContent||''));
    let box=h; for(let i=0;i<6&&box;i++){ if(box.querySelectorAll('button').length>=4) break; box=box.parentElement; }
    const btns=[...box.querySelectorAll('button')].filter(vis).map(e=>{
      const r=e.getBoundingClientRect();
      return {l:(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,44), y:Math.round(r.y), x:Math.round(r.x)};
    });
    return {desc: box.innerText.replace(/\s+/g,' ').slice(0,220), buttons:btns};
  });
  // click the ROW itself (the widest control on the row), not Open / Unarchive
  const before = await page.evaluate(()=>location.pathname);
  const clicked = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const rowBtn=[...document.querySelectorAll('button')].filter(vis)
      .filter(e=>/No activity yet/.test(e.textContent||''))
      .sort((a,b)=>b.getBoundingClientRect().width-a.getBoundingClientRect().width)[0];
    if(!rowBtn) return null;
    const label=(rowBtn.textContent||'').replace(/\s+/g,' ').trim().slice(0,40);
    rowBtn.click(); return label;
  });
  await page.waitForTimeout(3500);
  const after = await page.evaluate(()=>({url:location.pathname,
    archivedBanner:/This channel is archived/.test(document.body.innerText),
    stillInList: /Archived channels/.test(document.body.innerText)}));
  return {panel, rowClicked:clicked, before, after};
};
