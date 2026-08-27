import {WS, BASE} from './e-p2-helpers.mjs';
const counts = () => {
  const vis = e => { let x=e,o=1; while(x&&x!==document.documentElement){const s=getComputedStyle(x); if(s.display==='none'||s.visibility==='hidden')return false; o*=parseFloat(s.opacity||'1'); x=x.parentElement;} const r=e.getBoundingClientRect(); return o>0.01&&r.width>0&&r.height>0; };
  const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
  if(!dlg) return {noDialog:true};
  const tabs=[...dlg.querySelectorAll('button,[role=tab]')].filter(vis)
    .map(e=>({txt:(e.textContent||'').replace(/\s+/g,'').trim(), sel:e.getAttribute('aria-selected'), ds:e.getAttribute('data-state')}))
    .filter(o=>/^(All|Messages|Channels|People|Files)\d+$/.test(o.txt));
  const range=[...dlg.querySelectorAll('button')].filter(vis)
    .map(e=>({txt:(e.textContent||'').trim(), sel:e.getAttribute('aria-selected'), ds:e.getAttribute('data-state'), ap:e.getAttribute('aria-pressed')}))
    .filter(o=>/Last 7|Last 30|All time/.test(o.txt));
  return {tabs, range, body: dlg.innerText.replace(/\s+/g,' ').slice(120,360)};
};
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const net=[]; const h = async r => { const u=r.url(); if(!/\/api\/v1\/search\?/.test(u)) return;
    let b=null; try{b=await r.json()}catch{}
    net.push({q:decodeURIComponent((u.match(/[?&]q=([^&]*)/)||[])[1]||'').replace(/\+/g,' '),
      extra:(u.match(/[?&](limit|offset|type|channel_ids|from|to)=[^&]*/g)||[]).join('&'),
      tc:b?.total_channels, tm:b?.total_messages, tf:b?.total_files}); };
  page.on('response',h);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2200);
  const inp = page.locator('[role=dialog] input').first();
  await inp.waitFor({timeout:15000});
  await inp.type('e-arch', {delay:40});
  await page.waitForTimeout(4000);
  const beforeTab = await page.evaluate(counts);
  const netBefore = net.length;
  await page.evaluate(()=>{
    const vis = e => { const r=e.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const tab=[...dlg.querySelectorAll('button,[role=tab]')].filter(vis).find(e=>/^Channels\d/.test((e.textContent||'').replace(/\s+/g,'')));
    tab && tab.click();
  });
  await page.waitForTimeout(2500);
  const afterTab = await page.evaluate(counts);
  page.off('response',h);
  return {net, requestsBeforeTabClick: netBefore, requestsAfter: net.length, beforeTab, afterTab};
};
