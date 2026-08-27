import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const net=[]; const h = async r => { const u=r.url(); if(!/\/api\/v1\/search\?/.test(u)) return;
    let b=null; try{b=await r.json()}catch{}
    net.push({q:decodeURIComponent((u.match(/[?&]q=([^&]*)/)||[])[1]||'').replace(/\+/g,' '),
      totals:{tm:b?.total_messages,tc:b?.total_channels,tf:b?.total_files},
      msgs:(b?.messages||[]).map(m=>({id:m.id, ch:m.channel_id, archived:m.channel_archived===true,
        txt:(m.highlight||'').replace(/<\/?em>/g,'').slice(0,40)})) }); };
  page.on('response',h);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2200);
  const inp = page.locator('[role=dialog] input').first();
  await inp.waitFor({timeout:15000});
  await inp.type('notification probe', {delay:45});
  await page.waitForTimeout(5000);
  page.off('response',h);
  const ui = await page.evaluate(()=>{
    const vis = e => { let x=e,o=1; while(x&&x!==document.documentElement){const s=getComputedStyle(x); if(s.display==='none'||s.visibility==='hidden')return false; o*=parseFloat(s.opacity||'1'); x=x.parentElement;} const r=e.getBoundingClientRect(); return o>0.01&&r.width>0&&r.height>0; };
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const t=dlg.innerText.replace(/\s+/g,' ');
    // switch to Messages tab so ALL message rows render, not just the top-3 preview
    const tab=[...dlg.querySelectorAll('button')].filter(vis).find(e=>/^Messages\d/.test((e.textContent||'').replace(/\s+/g,'')));
    tab&&tab.click();
    return {counts:(t.match(/All \d+ Messages \d+ Channels \d+ People \d+ Files \d+/)||[''])[0]};
  });
  await page.waitForTimeout(2000);
  const rows = await page.evaluate(()=>{
    const vis = e => { let x=e,o=1; while(x&&x!==document.documentElement){const s=getComputedStyle(x); if(s.display==='none'||s.visibility==='hidden')return false; o*=parseFloat(s.opacity||'1'); x=x.parentElement;} const r=e.getBoundingClientRect(); return o>0.01&&r.width>0&&r.height>0; };
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    return [...dlg.querySelectorAll('button,a,[role=option]')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||'').trim()).filter(s=>/^Message:/.test(s)).map(s=>s.slice(0,70));
  });
  const last = net.filter(n=>n.q==='notification probe').pop();
  return {response:last, uiCounts:ui.counts, renderedRows:rows};
};
