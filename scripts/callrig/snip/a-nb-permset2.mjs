import { VIS } from './a-nb-lib.mjs';
// QA_ON / QA_OFF = comma lists of permission labels to tick / untick, then submit.
export default async ({page}) => {
  const on = (process.env.QA_ON||'').split(',').map(s=>s.trim()).filter(Boolean);
  const off = (process.env.QA_OFF||'').split(',').map(s=>s.trim()).filter(Boolean);
  const out = {on, off, net:[]};
  page.on('response', async (r)=>{ if(r.request().method()==='GET') return;
    if(!/admins/i.test(r.url())) return;
    out.net.push({m:r.request().method(), s:r.status(), u:r.url().replace(/^https:\/\/[^/]+/,''), req:(r.request().postData()||'')}); });
  const pick = ([names,v,want])=>{ const vis=eval(v);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(x=>x.querySelector('[data-testid="admin-permissions-submit"]')).pop();
    if(!d) return {err:'no dialog'};
    const done=[];
    for(const n of names){
      const b=[...d.querySelectorAll('input[type=checkbox]')].filter(vis)
        .find(i=>{const l=i.closest('label')||(i.id?d.querySelector('label[for="'+i.id+'"]'):null); return l&&(l.innerText||'').trim()===n;});
      if(b && b.checked!==want){ b.click(); done.push(n); }
    }
    return {done};
  };
  out.tickOn  = await page.evaluate(pick, [on, VIS, true]);
  await page.waitForTimeout(500);
  out.tickOff = await page.evaluate(pick, [off, VIS, false]);
  await page.waitForTimeout(700);
  out.before = await page.evaluate((v)=>{ const vis=eval(v);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)
      .filter(x=>x.querySelector('[data-testid="admin-permissions-submit"]')).pop();
    return [...d.querySelectorAll('input[type=checkbox]')].filter(vis)
      .map(i=>{const l=i.closest('label')||(i.id?d.querySelector('label[for="'+i.id+'"]'):null);
        return ((l&&l.innerText.trim())||'?')+'='+i.checked;}); }, VIS);
  await page.evaluate(()=>document.querySelector('[data-testid="admin-permissions-submit"]').click());
  await page.waitForTimeout(6000);
  return out;
}
