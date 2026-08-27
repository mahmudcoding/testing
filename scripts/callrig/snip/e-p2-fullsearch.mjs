import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url();
    if(u.includes('/api/v1/search')) api.push(r.status()+' '+u.split('/api/v1/')[1].slice(0,110)); });
  await page.goto(BASE+'/w/'+WS+'/search?q=probe', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  out.url = page.url().replace(/^https:\/\/[^/]+/,'').slice(0,60);
  out.page = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main')||document.body;
     return { text:(m.innerText||'').replace(/\\s+/g,' ').slice(0,340),
              controls:[...new Set([...m.querySelectorAll('button,[role=tab],a[href],select,input')].filter(vis)
                .map(b=>{const n=(b.getAttribute('aria-label')||b.getAttribute('placeholder')||b.textContent||'').replace(/\\s+/g,' ').trim().slice(0,28);
                  const s=b.getAttribute('aria-selected')||b.getAttribute('aria-pressed')||'';
                  return n+(s?('/'+s):''); }).filter(Boolean))].slice(0,24) }; })()`);
  out.api = api.slice(0,3);
  return out;
};
