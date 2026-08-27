import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  // CLAIM (finding 1): the dialog shows a removable channel chip; the full-search page does not
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('[aria-label="Search QA Workspace E"]').first().click();
  await page.waitForTimeout(2200);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:40});
  await page.waitForTimeout(4000);
  out.dialogChips = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    return [...d.querySelectorAll('button')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||'')).filter(x=>/^Remove /.test(x));
  });
  await page.locator('[role=dialog] button').filter({hasText:/^Open full search$/}).first().click();
  await page.waitForTimeout(6000);
  out.fullSearch = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const m=document.querySelector('main')||document.body;
    return {url:location.pathname+location.search,
      removeChips:[...m.querySelectorAll('button')].filter(vis)
        .map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim()).filter(x=>/^Remove |×|✕/.test(x)),
      anyChannelChipText:/in #/.test(m.innerText)};
  });
  // CLAIM (finding 10): the week view marks today's column
  await page.goto(`${BASE}/w/${WS}/calendar`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  await page.locator('main button').filter({hasText:/^Week$/}).first().click();
  await page.waitForTimeout(3500);
  out.week = await page.evaluate(()=>{
    const now=new Date(); const dd=now.getDate();
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const m=document.querySelector('main');
    // day headers: leaf nodes that are a bare day number
    const heads=[...m.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0
      && /^\d{1,2}$/.test((e.textContent||'').trim()) && e.getBoundingClientRect().y<300)
      .map(e=>({d:e.textContent.trim(), bg:getComputedStyle(e).backgroundColor,
        color:getComputedStyle(e).color, weight:getComputedStyle(e).fontWeight}));
    const today=heads.find(h=>Number(h.d)===dd);
    const others=heads.filter(h=>Number(h.d)!==dd);
    return {localDay:dd, headers:heads.length, today,
      todayLooksDistinct: !!today && others.length>0 &&
        (others.every(o=>o.bg!==today.bg) || others.every(o=>o.color!==today.color))};
  });
  return out;
};
