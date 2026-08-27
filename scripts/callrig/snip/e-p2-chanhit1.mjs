import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const net=[]; const h=async r=>{const u=r.url(); if(!/\/api\/v1\/search\?/.test(u))return;
    let b=null; try{b=await r.json()}catch{}
    net.push({q:decodeURIComponent((u.match(/[?&]q=([^&]*)/)||[])[1]||'').replace(/\+/g,' '),
      tc:b?.total_channels, chans:(b?.channels||[]).map(c=>({name:c.name, arch:c.is_archived===true}))});};
  page.on('response',h);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('search-control',{delay:45});
  await page.waitForTimeout(5000);
  page.off('response',h);
  const ui = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const t=d.innerText.replace(/\s+/g,' ');
    const rows=[...d.querySelectorAll('[role],[tabindex],button,a,li')].filter(vis)
      .filter(e=>/^Open channel/.test((e.textContent||'').replace(/\s+/g,' ').trim()))
      .map(e=>(e.textContent||'').replace(/\s+/g,' ').trim().slice(0,50));
    return {counts:(t.match(/All \d+ Messages \d+ Channels \d+/)||[''])[0], channelRows:[...new Set(rows)]};
  });
  return {requests:net.filter(n=>n.q==='search-control'), ui};
};
