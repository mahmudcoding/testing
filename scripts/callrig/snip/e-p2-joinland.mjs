import {VISFN} from './e-p2-helpers.mjs';
const TOK = process.env.QA_TOK;
export default async ({page}) => {
  const out={};
  const probe = async (label, url) => {
    const api=[];
    const onR = async r => { const u=r.url(); if(u.includes('/api/v1/')){ let b=''; try{b=(await r.text()).slice(0,180);}catch(e){}
      api.push(r.status()+' '+r.request().method()+' '+u.split('/api/v1/')[1].slice(0,48)+' :: '+b.replace(/\s+/g,' ')); } };
    page.on('response', onR);
    await page.goto(url, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(8000);
    const r = await page.evaluate(`(() => { ${VISFN}
      const m=document.querySelector('main')||document.body;
      return { text:(m.innerText||'').replace(/\\s+/g,' ').slice(0,340),
               controls:[...m.querySelectorAll('button,a[href]')].filter(vis)
                 .map(n=>(n.getAttribute('aria-label')||n.textContent||'').replace(/\\s+/g,' ').trim().slice(0,34)).filter(Boolean).slice(0,14) }; })()`);
    page.off('response', onR);
    return { label, url: url.replace(/^https:\/\/[^/]+/,'').slice(0,70), landedOn: page.url().replace(/^https:\/\/[^/]+/,'').slice(0,80),
             api: api.filter(a=>/join|meeting|calendar/i.test(a)).slice(0,4), ...r };
  };
  out.valid   = await probe('valid token',   'https://airion-cargo.store/calendar/join/'+TOK);
  out.bogus   = await probe('bogus token',   'https://airion-cargo.store/calendar/join/'+'0'.repeat(64));
  out.short   = await probe('malformed',     'https://airion-cargo.store/calendar/join/not-a-token');
  return out;
};
