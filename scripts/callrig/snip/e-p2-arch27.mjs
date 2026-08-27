import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4OX3463S8ECN8X`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const onScreen = await page.evaluate(()=>({
    msgs:[...document.querySelectorAll('[data-message-id]')].map(m=>m.innerText.replace(/\s+/g,' ').slice(0,60)),
    banner:/This channel is archived/.test(document.body.innerText)}));
  const net=[]; const h = async r => { const u=r.url(); if(!/\/api\/v1\/search\?/.test(u)) return;
    let b=null; try{b=await r.json()}catch{}
    net.push({q:decodeURIComponent((u.match(/[?&]q=([^&]*)/)||[])[1]||'').replace(/\+/g,' '),
      scopedToChannel:/channel_ids=/.test(u),
      tm:b?.total_messages, tc:b?.total_channels,
      archMsgs:(b?.messages||[]).filter(m=>m.channel_archived===true).length}); };
  page.on('response',h);
  await page.locator('button[aria-label="Search in channel"]').click();
  await page.waitForTimeout(2200);
  const inp=page.locator('[role=dialog] input').first();
  await inp.waitFor({timeout:15000});
  await inp.type('archive notification probe',{delay:40});
  await page.waitForTimeout(5000);
  page.off('response',h);
  const ui = await page.evaluate(()=>{
    const vis = e => { let x=e,o=1; while(x&&x!==document.documentElement){const s=getComputedStyle(x); if(s.display==='none'||s.visibility==='hidden')return false; o*=parseFloat(s.opacity||'1'); x=x.parentElement;} const r=e.getBoundingClientRect(); return o>0.01&&r.width>0&&r.height>0; };
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const t=d.innerText.replace(/\s+/g,' ');
    return {counts:(t.match(/All \d+ Messages \d+ Channels \d+ People \d+ Files \d+/)||[''])[0],
      rows:[...d.querySelectorAll('button,a,[role=option]')].filter(vis)
        .map(e=>(e.getAttribute('aria-label')||'').trim()).filter(x=>/^Message:/.test(x)),
      body:t.slice(t.indexOf('All ')||0, 300)};
  });
  return {onScreen, net, ui};
};
