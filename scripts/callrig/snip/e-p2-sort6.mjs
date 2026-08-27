import {WS, BASE} from './e-p2-helpers.mjs';
const order = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
  // enumerate anything that looks interactive, not just button/a
  const nodes=[...d.querySelectorAll('[role],[tabindex],button,a,li')].filter(vis);
  const rows=nodes.filter(e=>/^Open message/.test((e.textContent||'').replace(/\s+/g,' ').trim()));
  return {sortLabel:([...d.querySelectorAll('button')].filter(vis).map(e=>(e.textContent||'').trim())
            .find(t=>/^(Relevance|Date|Alphabetical)$/.test(t))||'?'),
    rowTag: rows[0]? rows[0].tagName+'/'+(rows[0].getAttribute('role')||'-') : 'none',
    seq: rows.map(e=>(e.textContent||'').replace(/\s+/g,' ').replace(/^Open message /,'').slice(0,40)).slice(0,7)};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:40});
  await page.waitForTimeout(4500);
  await page.locator('[role=dialog] button').filter({hasText:/^Messages\d+$/}).first().click();
  await page.waitForTimeout(2800);
  const out={start: await page.evaluate(order)};
  for (const opt of ['Date','Alphabetical','Relevance']) {
    await page.locator('[role=dialog] button').filter({hasText:/^(Relevance|Date|Alphabetical)$/}).first().click();
    await page.waitForTimeout(1400);
    await page.locator('[role=menu] button').filter({hasText:new RegExp('^'+opt+'$')}).first().click();
    await page.waitForTimeout(3200);
    out[opt]= await page.evaluate(order);
  }
  return out;
};
