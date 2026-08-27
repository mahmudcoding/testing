import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  // FINDING 1: a message in a channel you are NOT sitting in; dialog finds it, Open full search loses it
  const token='hv'+Math.floor(Date.now()/1000).toString(36);
  const posted = await page.evaluate(async (tok)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:'C4QEPRIVATE0001', body:'high1 recheck '+tok})});
    return {status:r.status};
  }, token);
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type(token,{delay:45});
  await page.waitForTimeout(5000);
  const inDialog = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const t=d.innerText.replace(/\s+/g,' ');
    return {counts:(t.match(/All \d+ Messages \d+/)||[''])[0],
      rows:[...d.querySelectorAll('[role=option]')].filter(vis).length};
  });
  const net=[]; const h=r=>{const u=r.url(); if(/\/api\/v1\/search\?/.test(u))
    net.push({scoped:/channel_ids=/.test(u), chan:(u.match(/channel_ids=([^&]*)/)||[])[1]||null});};
  page.on('response',h);
  await page.locator('[role=dialog] button').filter({hasText:/^Open full search$/}).first().click();
  await page.waitForTimeout(6000);
  page.off('response',h);
  const full = await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    const t=m.innerText.replace(/\s+/g,' ');
    return {url:location.pathname+location.search,
      counts:(t.match(/All \d+|Showing \d+ result/)||[''])[0],
      noResults:/No results/.test(t)};
  });
  return {postStatus:posted.status, token, inDialog,
    fullSearchRequest:net[net.length-1]||null, full,
    stillReproduces: inDialog.rows>0 && full.noResults};
};
