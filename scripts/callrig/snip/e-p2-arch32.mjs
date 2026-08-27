import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4OX3463S8ECN8X`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const ev=[]; let phase='typing';
  const h=async r=>{const u=r.url(); if(!/\/api\/v1\/search\?/.test(u))return; let b=null; try{b=await r.json()}catch{}
    ev.push({phase, q:decodeURIComponent((u.match(/[?&]q=([^&]*)/)||[])[1]||''),
      scoped:/channel_ids=/.test(u), tm:b?.total_messages,
      archInBody:(b?.messages||[]).filter(m=>m.channel_archived===true).length});};
  page.on('response',h);
  await page.locator('button[aria-label="Search in channel"]').click();
  await page.waitForTimeout(2500);
  const inp=page.locator('[role=dialog] input').first();
  await inp.waitFor({timeout:15000}); await inp.click(); await inp.type('archive',{delay:60});
  await page.waitForTimeout(7000);
  const withChip = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const t=d.innerText.replace(/\s+/g,' ');
    const chip=[...d.querySelectorAll('button')].filter(vis).find(e=>/^Remove in #/.test(e.getAttribute('aria-label')||''));
    return {tabs:(t.match(/All ?\d* Messages ?\d*/)||[''])[0], noResults:/No results/.test(t),
            chipControl: chip? chip.getAttribute('aria-label') : null};
  });
  phase='after-chip-removed';
  await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const chip=[...d.querySelectorAll('button')].filter(vis).find(e=>/^Remove in #/.test(e.getAttribute('aria-label')||''));
    chip && chip.click();
  });
  await page.waitForTimeout(6000);
  page.off('response',h);
  const afterChip = await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    const t=d.innerText.replace(/\s+/g,' ');
    return {tabs:(t.match(/All ?\d* Messages ?\d*/)||[''])[0], noResults:/No results/.test(t),
            chipControl: [...d.querySelectorAll('button')].filter(vis).some(e=>/^Remove in #/.test(e.getAttribute('aria-label')||''))};
  });
  return {requestsByPhase:ev, withChip, afterChip};
};
