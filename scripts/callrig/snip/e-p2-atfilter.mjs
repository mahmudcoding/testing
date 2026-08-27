import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('response', r=>{ const u=r.url(); if(/\/api\/v1\/search/.test(u))
    reqs.push(decodeURIComponent(u.split('/api/v1/')[1]).slice(0,130)); });
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
       return {chips:[...d.querySelectorAll('button')].filter(vis)
                 .map(b=>b.getAttribute('aria-label')||'').filter(a=>/Remove .* filter/.test(a)),
               rows:[...d.querySelectorAll('[role=option]')].filter(vis).length}; })()`);
    await page.keyboard.press('Escape'); await page.waitForTimeout(1100);
    const req=reqs[reqs.length-1]||'(none)';
    return {typed, chips:ui.chips, rows:ui.rows, q:(req.match(/q=([^&]*)/)||[])[1]||null,
            hasAuthorParam:/author|user_id|sender|from=/.test(req)};
  };
  // does the :@ filter produce a chip too? (finding 5 says the token is dropped)
  out.singleWordName = await probe(':@ Bob unread');
  out.twoWordName    = await probe(':@ QA Bob unread');
  out.otherSingle    = await probe(':@ Carol unread');
  out.username       = await probe(':@ qa_e_bob unread');
  return out;
};
