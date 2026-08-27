import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('response', r=>{ const u=r.url(); if(/\/api\/v1\/search/.test(u))
    reqs.push(decodeURIComponent(u.split('/api/v1/')[1]).slice(0,140)); });
  const probe = async (typed) => {
    await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(8500);
    await page.evaluate(`(() => { ${VISFN}
       const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
       if(b) b.click(); })()`);
    await page.waitForTimeout(2600); reqs.length=0;
    await page.keyboard.type(typed); await page.waitForTimeout(5500);
    const ui = await page.evaluate(`(() => { ${VISFN}
       const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>300).pop();
       const chips=[...d.querySelectorAll('button')].filter(vis)
         .map(b=>(b.getAttribute('aria-label')||'')).filter(a=>/Remove .* filter/.test(a));
       const rows=[...d.querySelectorAll('[role=option]')].filter(vis)
         .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim());
       return {chips, nRows:rows.length,
               channels:[...new Set(rows.map(r=>(r.match(/#[\\w-]+/)||[''])[0]).filter(Boolean))]}; })()`);
    await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
    const req = reqs[reqs.length-1]||'(none)';
    return {typed, chip:ui.chips[0]||null, scoped:/channel_ids=/.test(req),
            channelIds:(req.match(/channel_ids=([^&]*)/)||[])[1]||null,
            nRows:ui.nRows, resultChannels:ui.channels};
  };
  out.memberChannel    = await probe(':in #qa-private probe');
  out.nonMemberChannel = await probe(':in #qa-empty probe');
  out.nonexistent      = await probe(':in #no-such-channel-xyz probe');
  return out;
};
