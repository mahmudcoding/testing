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
  const rows = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const all=[...d.querySelectorAll('[role],[tabindex],button,a,li,div')].filter(vis)
      .filter(e=>e.children.length<=3 && /e-search-control/.test((e.textContent||'')))
      .map(e=>({tag:e.tagName, role:e.getAttribute('role'), id:e.id||null,
        txt:(e.textContent||'').replace(/\s+/g,' ').trim().slice(0,44)}));
    return {panel:d.innerText.replace(/\s+/g,' ').slice(120,340), matches:all.slice(0,5)};
  });
  const before = page.url();
  await page.keyboard.press('ArrowDown'); await page.waitForTimeout(600);
  await page.keyboard.press('Enter'); await page.waitForTimeout(4000);
  const after = await page.evaluate(()=>({url:location.pathname,
    header:(document.querySelector('main')||document.body).innerText.replace(/\s+/g,' ').slice(0,70),
    dialogOpen: !!([...document.querySelectorAll('[role=dialog]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;}).pop())}));
  return {rows, urlBefore:before.replace(/https?:\/\/[^/]+/,''), after,
    landedOnCreatedChannel: after.url.includes('C4OXCHJIGRU6EZQ')};
};
