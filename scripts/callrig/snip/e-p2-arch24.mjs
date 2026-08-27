import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const net=[]; const h = async r => { const u=r.url(); if(!/\/api\/v1\/search\?/.test(u)) return;
    let b=null; try{b=await r.json()}catch{}
    net.push({q:decodeURIComponent((u.match(/[?&]q=([^&]*)/)||[])[1]||'').replace(/\+/g,' '),
      totals:{tm:b?.total_messages,tc:b?.total_channels,tu:b?.total_users,tf:b?.total_files},
      arrayLengths:{messages:(b?.messages||[]).length, channels:(b?.channels||[]).length,
                    users:(b?.users||[]).length, files:(b?.files||[]).length},
      channelObjs:(b?.channels||[]).map(c=>JSON.stringify(c).slice(0,220)),
      messageObjs:(b?.messages||[]).map(m=>JSON.stringify(m).slice(0,220))}); };
  page.on('response',h);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2200);
  const inp = page.locator('[role=dialog] input').first();
  await inp.waitFor({timeout:15000});
  await inp.type('e-arch', {delay:45});
  await page.waitForTimeout(4500);
  page.off('response',h);
  const ui = await page.evaluate(()=>{
    const vis = e => { let x=e,o=1; while(x&&x!==document.documentElement){const s=getComputedStyle(x); if(s.display==='none'||s.visibility==='hidden')return false; o*=parseFloat(s.opacity||'1'); x=x.parentElement;} const r=e.getBoundingClientRect(); return o>0.01&&r.width>0&&r.height>0; };
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const t=dlg.innerText.replace(/\s+/g,' ');
    return {tabs:(t.match(/All \d+ Messages \d+ Channels \d+ People \d+ Files \d+/)||[''])[0],
            footer:(t.match(/Showing[^”]*”[^.]*\./)||[''])[0], full:t.slice(150,470)};
  });
  return {net: net.filter(n=>n.q==='e-arch'), ui};
};
