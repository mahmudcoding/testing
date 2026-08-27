import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('search-control',{delay:45});
  await page.waitForTimeout(4500);
  await page.locator('[role=dialog] button').filter({hasText:/^Channels\d+$/}).first().click();
  await page.waitForTimeout(2500);
  const read = () => {
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const host=d.querySelector('[aria-activedescendant]');
    const id=host?host.getAttribute('aria-activedescendant'):null;
    const opts=[...d.querySelectorAll('[role=option]')].filter(vis)
      .map(e=>({id:e.id, txt:(e.textContent||'').replace(/\s+/g,' ').trim().slice(0,50)}));
    return {activeId:id, optionCount:opts.length, options:opts};
  };
  const s1 = await page.evaluate(read);
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(700);
  const s2 = await page.evaluate(read);
  const urlBefore = page.url();
  await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
  const afterEnter = await page.evaluate(()=>({url:location.pathname,
    dialogOpen: !!([...document.querySelectorAll('[role=dialog]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;}).pop())}));
  // if Enter did nothing, try a direct click on the option
  let afterClick=null;
  if (afterEnter.url===new URL(urlBefore).pathname) {
    const opt = page.locator('[role=dialog] [role=option]').first();
    if (await opt.count()) { await opt.click(); await page.waitForTimeout(3500);
      afterClick = await page.evaluate(()=>({url:location.pathname,
        header:(document.querySelector('main')||document.body).innerText.replace(/\s+/g,' ').slice(0,60)})); }
  }
  return {beforeArrow:s1, afterArrow:s2, afterEnter, afterClick,
    targetChannelId:'C4OXCHJIGRU6EZQ'};
};
