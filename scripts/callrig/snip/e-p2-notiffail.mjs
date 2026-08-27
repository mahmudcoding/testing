import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const api=[]; const toasts=[];
  page.on('response', async r => { const u=r.url(); const m=r.request().method();
    if(u.includes('/api/v1/notifications/settings')){ let b=''; try{b=(await r.text()).slice(0,240);}catch(e){}
      api.push({st:r.status, m, req:(r.request().postData()||''), res:b.replace(/\s+/g,' '),
                accLang:(r.request().headers()['accept-language']||'(none)')}); }});
  await page.goto(BASE+'/w/'+WS+'/settings/notifications', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  out.uiLang = await page.evaluate(`(() => document.documentElement.lang || '(unset)')()`);
  const st = `(() => { ${VISFN} const m=document.querySelector('main');
     return [...m.querySelectorAll('[role=switch]')].filter(vis).map(n=>n.getAttribute('aria-checked')).join(','); })()`;
  // poll for any visible notice from BEFORE the save click
  const poll = setInterval(()=>{}, 1e9);
  const grab = async () => await page.evaluate(`(() => { ${VISFN}
     return [...document.querySelectorAll('[role=alert],[role=status],[data-sonner-toast],[class*=oast],[class*=rror]')]
       .filter(vis).map(n=>(n.innerText||'').replace(/\\s+/g,' ').trim().slice(0,90)).filter(Boolean); })()`);
  out.before = await page.evaluate(st);
  await page.evaluate(`(() => { ${VISFN} [...document.querySelector('main').querySelectorAll('[role=switch]')].filter(vis)[0].click(); })()`);
  await page.waitForTimeout(1200);
  api.length=0;
  const samples=[]; samples.push({t:0, v:await grab()});
  await page.evaluate(`(() => { ${VISFN} const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
     .find(x=>(x.textContent||'').trim()==='Save preferences'); b.click(); })()`);
  for (let i=1;i<=16;i++){ await page.waitForTimeout(300); samples.push({t:i*300, v:await grab()}); }
  clearInterval(poll);
  out.noticeSamples = samples.filter(s=>s.v.length).slice(0,6);
  out.noticeCount = samples.filter(s=>s.v.length).length + '/' + samples.length;
  out.call1 = api[0]||null;
  out.afterSave = await page.evaluate(st);
  out.unsavedBar = await page.evaluate(`(() => ((document.querySelector('main')||document.body).innerText||'').includes('unsaved change'))()`);
  out.saveBtn = await page.evaluate(`(() => { ${VISFN} const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
     .find(x=>(x.textContent||'').trim()==='Save preferences'); return b? 'present, disabled='+b.disabled : 'gone'; })()`);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(6500);
  out.afterReload = await page.evaluate(st);
  // boundary: in_app off + mute on, exactly what the server message suggests
  api.length=0;
  await page.evaluate(`(() => { ${VISFN} const s=[...document.querySelector('main').querySelectorAll('[role=switch]')].filter(vis);
     s[0].click(); s[1].click(); })()`);
  await page.waitForTimeout(1200);
  await page.evaluate(`(() => { ${VISFN} const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
     .find(x=>(x.textContent||'').trim()==='Save preferences'); b.click(); })()`);
  await page.waitForTimeout(5000);
  out.call2 = api[0]||null;
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(6500);
  out.afterReload2 = await page.evaluate(st);
  return out;
};
