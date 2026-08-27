import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  // full search page, reached directly (finding 1 covers the in-channel scoping trap)
  await page.goto(`${BASE}/w/${WS}/directories`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3000);
  const net=[]; const h = async r => { const u=r.url(); if(!/\/api\/v1\/search\?/.test(u)) return;
    let b=null; try{b=await r.json()}catch{}
    net.push({q:decodeURIComponent((u.match(/[?&]q=([^&]*)/)||[])[1]||'').replace(/\+/g,' '),
      scoped:/channel_ids=/.test(u),
      tm:b?.total_messages, tc:b?.total_channels,
      archMsgs:(b?.messages||[]).filter(m=>m.channel_archived===true).length,
      archChans:(b?.channels||[]).filter(c=>c.is_archived===true).length}); };
  page.on('response',h);
  await page.goto(`${BASE}/w/${WS}/search?q=${encodeURIComponent('archive notification probe')}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  page.off('response',h);
  const ui = await page.evaluate(()=>{
    const vis = e => { let x=e,o=1; while(x&&x!==document.documentElement){const s=getComputedStyle(x); if(s.display==='none'||s.visibility==='hidden')return false; o*=parseFloat(s.opacity||'1'); x=x.parentElement;} const r=e.getBoundingClientRect(); return o>0.01&&r.width>0&&r.height>0; };
    const m=document.querySelector('main')||document.body;
    const rows=[...m.querySelectorAll('button,a,[role=option]')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim())
      .filter(t=>/^Message:|^Channel:/.test(t));
    return {url:location.pathname+location.search,
      counts:(m.innerText.replace(/\s+/g,' ').match(/All \d+ Messages \d+ Channels \d+ People \d+ Files \d+/)||[''])[0],
      rowCount: rows.length,
      mentionsArchived: /archive notification probe/.test(m.innerText),
      head: m.innerText.replace(/\s+/g,' ').slice(0,220)};
  });
  return {net, ui};
};
