import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url();
    if(u.includes('/api/v1/notifications/settings')&&r.request().method()!=='GET'){ let b=''; try{b=(await r.text()).slice(0,200);}catch(e){}
      api.push(r.status()+' '+r.request().postData()+' -> '+b.replace(/\s+/g,' ')); }});
  await page.goto(BASE+'/w/'+WS+'/settings/notifications', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const st=`(() => { ${VISFN} return [...document.querySelector('main').querySelectorAll('[role=switch]')].filter(vis).map(n=>n.getAttribute('aria-checked')).join(','); })()`;
  out.before = await page.evaluate(st);
  await page.evaluate(`(() => { ${VISFN} const s=[...document.querySelector('main').querySelectorAll('[role=switch]')].filter(vis);
     if(s[0].getAttribute('aria-checked')==='false') s[0].click();
     if(s[1].getAttribute('aria-checked')==='true')  s[1].click(); })()`);
  await page.waitForTimeout(1200);
  await page.evaluate(`(() => { ${VISFN} const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
     .find(x=>(x.textContent||'').trim()==='Save preferences'); if(b) b.click(); })()`);
  await page.waitForTimeout(5000);
  out.req = api.slice(0,2);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(6500);
  out.afterReload = await page.evaluate(st);
  return out;
};
