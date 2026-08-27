import {VISFN, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const net=[];
  page.on('response', async r=>{ const u=r.url();
    if(/calendar\/join/.test(u)){ let b=''; try{b=(await r.text()).slice(0,180);}catch(e){}
      net.push(r.request().method()+' '+r.status()+' '+b); }});
  await page.goto(BASE+'/calendar/join/NOTAREALTOKEN12345', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(11000);
  out.net = net.slice(0,2);
  out.page = await page.evaluate(`(() => { ${VISFN}
     const t=(document.body.innerText||'').replace(/\\s+/g,' ').trim();
     const all=[...document.querySelectorAll('button,a[href],[tabindex],[role=button],[role=link],input,select,textarea')]
       .map(e=>({tag:e.tagName, tx:(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,22),
                 al:(e.getAttribute('aria-label')||'').slice(0,22), vis:vis(e)?1:0}));
     return {url:location.pathname, bodyText:t.slice(0,140), bodyLen:t.length,
             nAll:all.length, nVisible:all.filter(e=>e.vis).length, controls:all.slice(0,8),
             scrollH:document.documentElement.scrollHeight, clientH:document.documentElement.clientHeight}; })()`);
  return out;
};
