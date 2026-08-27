import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('viewer',{delay:45});
  await page.waitForTimeout(4500);
  const before = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    return {url:location.href, dialogs:[...document.querySelectorAll('[role=dialog]')].filter(vis).length,
      counts:(d.innerText.replace(/\s+/g,' ').match(/All \d+ Messages \d+ Channels \d+ People \d+ Files \d+/)||[''])[0]};
  });
  // click the first FILE result (All tab shows a FILES section)
  const clicked = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const opt=[...d.querySelectorAll('[role=option]')].filter(vis)
      .find(e=>/\.(png|txt|zip|wav|mp4)/i.test(e.textContent||''));
    if(!opt) return null;
    const label=(opt.textContent||'').replace(/\s+/g,' ').trim().slice(0,44);
    opt.click(); return label;
  });
  await page.waitForTimeout(4000);
  const after = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(vis);
    return {url:location.href, dialogs:ds.length,
      topDialogText: ds.length? ds[ds.length-1].innerText.replace(/\s+/g,' ').slice(0,140):null,
      hasImg: ds.some(d=>!!d.querySelector('img,video,audio')),
      viewerControls: ds.length? [...ds[ds.length-1].querySelectorAll('button')].filter(vis)
        .map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,22)).filter(Boolean).slice(0,8):[]};
  });
  return {before:{...before,url:before.url.replace(/https?:\/\/[^/]+/,'')}, clickedRow:clicked,
    after:{...after,url:after.url.replace(/https?:\/\/[^/]+/,'')}};
};
