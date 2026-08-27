import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url(); const m=r.request().method();
    if(u.includes('/api/v1/')&&m!=='GET'){ let b=''; try{b=(await r.text()).slice(0,140);}catch(e){}
      api.push(r.status()+' '+m+' '+u.split('/api/v1/')[1].slice(0,52)+' :: '+b.replace(/\s+/g,' ')); }});
  await page.goto(BASE+'/w/'+WS+'/directories?tab=channels', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const snap = `(() => { ${VISFN}
    const m=document.querySelector('main');
    const rows=[...m.querySelectorAll('div,li')].filter(e=>vis(e)&&/#|qa-/.test(e.innerText||'')&&(e.innerText||'').length<200)
      .filter((r,_,a)=>!a.some(o=>o!==r&&r.contains(o)));
    return { text:(m.innerText||'').replace(/\\s+/g,' ').slice(0,320),
             rowCtls: rows.slice(0,8).map(r=>((r.innerText||'').replace(/\\s+/g,' ').slice(0,44))+' >> '+
               [...r.querySelectorAll('button,a[href]')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,22)).join('|')) }; })()`;
  out.before = await page.evaluate(snap);
  out.sidebarBefore = await page.evaluate(`(() => { ${VISFN}
     const nav=document.querySelector('nav')||document.body;
     return [...nav.querySelectorAll('a[href*="/c/"]')].filter(vis).map(a=>(a.textContent||'').trim().slice(0,20)); })()`);
  return out;
};
