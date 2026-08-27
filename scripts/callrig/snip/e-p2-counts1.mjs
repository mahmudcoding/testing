import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const net=[]; const h=async r=>{const u=r.url(); if(!/\/api\/v1\/search\?/.test(u))return;
    let b=null; try{b=await r.json()}catch{}
    net.push({q:decodeURIComponent((u.match(/[?&]q=([^&]*)/)||[])[1]||'').replace(/\+/g,' '),
      limit:(u.match(/limit=(\d+)/)||[])[1], offset:(u.match(/offset=(\d+)/)||[])[1]||'0',
      tm:b?.total_messages, tf:b?.total_files, tc:b?.total_channels, tu:b?.total_users,
      nMsgs:(b?.messages||[]).length,
      archMsgs:(b?.messages||[]).filter(m=>m.channel_archived===true).length});};
  page.on('response',h);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:40});
  await page.waitForTimeout(5000);
  page.off('response',h);
  const ui = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const t=d.innerText.replace(/\s+/g,' ');
    return {tabs:(t.match(/All \d+ Messages \d+ Channels \d+ People \d+ Files \d+/)||[''])[0],
      footer:(t.match(/Showing[^↑]*/)||[''])[0].trim().slice(0,120),
      renderedRows:[...d.querySelectorAll('[role=option]')].filter(vis).length};
  });
  const last=net.filter(n=>n.q==='probe').pop();
  return {serverLast:last, ui, allRequests:net.filter(n=>n.q==='probe').length};
};
