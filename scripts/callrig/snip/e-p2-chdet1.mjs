import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Channel details"]').first().click();
  await page.waitForTimeout(3000);
  const tabs = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    return [...document.querySelectorAll('button,[role=tab]')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,22))
      .filter(t=>/^(About|Members|Files|Pinned|Media)/i.test(t));
  });
  let filesTab=null, preview=null;
  if (tabs.some(t=>/^Files/i.test(t))) {
    await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const b=[...document.querySelectorAll('button,[role=tab]')].filter(vis)
        .find(e=>/^Files/i.test((e.textContent||'').trim())); b&&b.click();
    });
    await page.waitForTimeout(2500);
    filesTab = await page.evaluate(()=>{
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const names=[...document.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0
        && /\.(png|txt|zip|wav|mp4)$/i.test((e.textContent||'').trim()))
        .map(e=>e.textContent.trim());
      return {files:[...new Set(names)].slice(0,8)};
    });
  }
  return {tabs, filesTab};
};
