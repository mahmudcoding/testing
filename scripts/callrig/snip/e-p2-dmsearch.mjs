import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('response', r=>{ const u=r.url(); if(/\/api\/v1\/search/.test(u))
    reqs.push(decodeURIComponent(u.split('/api/v1/')[1]).slice(0,150)); });
  const probe = async (typed) => {
    await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(8500);
    await page.evaluate(`(() => { ${VISFN}
       const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
       if(b) b.click(); })()`);
    await page.waitForTimeout(2600); reqs.length=0;
    await page.keyboard.type(typed); await page.waitForTimeout(5200);
    const ui = await page.evaluate(`(() => { ${VISFN}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
       const rows=[...d.querySelectorAll('[role=option]')].filter(vis)
         .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,50));
       return {rows}; })()`);
    await page.keyboard.press('Escape'); await page.waitForTimeout(1100);
    const req=reqs[reqs.length-1]||'(none)';
    return {typed, n:ui.rows.length, rows:ui.rows.slice(0,3),
            dmIds:(req.match(/dm_ids=([^&]*)/)||[])[1]||null,
            channelIds:(req.match(/channel_ids=([^&]*)/)||[])[1]||null};
  };
  // the contract lists dm_ids as a separate parameter — does :@ ever use it?
  out.withDm    = await probe(':@ Bob dm');
  out.plainDm   = await probe('dm');
  return out;
};
