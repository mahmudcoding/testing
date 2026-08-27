import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const room = process.env.QA_ROOM || 'Eve Room 1';
  const out={net:[]};
  page.on('response', async r=>{ if(r.request().method()==='GET')return; if(!/room/i.test(r.url()))return;
    out.net.push({m:r.request().method(),s:r.status(),u:r.url().replace(/^https:\/\/[^/]+/,'')}); });
  out.click = await page.evaluate(([n,v])=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]'); if(!p) return {err:'no panel'};
    const row=[...p.querySelectorAll('*')].filter(vis).filter(e=>(e.innerText||'').includes(n))
      .filter(e=>[...e.querySelectorAll('button')].some(b=>/^Join$/.test((b.textContent||'').trim())))
      .sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length)[0];
    if(!row) return {err:'no row for '+n, panel:(p.innerText||'').replace(/\s+/g,' ').slice(0,160)};
    const b=[...row.querySelectorAll('button')].filter(vis).find(x=>/^Join$/.test((x.textContent||'').trim()));
    b.click(); return {ok:true}; }, [room, VIS]);
  await page.waitForTimeout(8000);
  out.panel = await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return (p?.innerText||'').replace(/\s+/g,' ').slice(0,180);});
  return out;
};
