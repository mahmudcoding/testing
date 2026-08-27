import {WS, BASE} from './e-p2-helpers.mjs';
async function q(page, text){
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const net=[]; const h=async r=>{const u=r.url(); if(!/\/api\/v1\/search\?/.test(u))return;
    let b=null; try{b=await r.json()}catch{}
    net.push({q:decodeURIComponent((u.match(/[?&]q=([^&]*)/)||[])[1]||'').replace(/\+/g,' '), tm:b?.total_messages});};
  page.on('response',h);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type(text,{delay:45});
  await page.waitForTimeout(5000);
  page.off('response',h);
  const ui=await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
    return {chips:[...d.querySelectorAll('button')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||'')).filter(x=>/^Remove /.test(x)),
      inputValue:(d.querySelector('input')||{}).value};
  });
  return {typed:text, inputValue:ui.inputValue, chips:ui.chips, lastQ:(net[net.length-1]||{}).q, tm:(net[net.length-1]||{}).tm};
}
export default async ({page}) => ({
  r1: await q(page,':@ QA Bob :in #qa-general probe'),
  r2: await q(page,':@ QA Bob :in #qa-general probe'),
  r3: await q(page,':@ QA Carol probe'),
  r4: await q(page,':@ Bob probe'),
});
