import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const out={net:[]};
  page.on('response', async r=>{ if(r.request().method()==='GET')return; if(!/\/api\/v1\//.test(r.url()))return;
    out.net.push({m:r.request().method(),s:r.status(),u:r.url().replace(/^https:\/\/[^/]+/,'')}); });
  const t = page.locator('[data-testid="call-controls-people-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed'))!=='true'){ await t.click(); await page.waitForTimeout(2000); }
  out.click = await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const b=[...p.querySelectorAll('button')].filter(vis).find(x=>/^Unban/i.test((x.getAttribute('aria-label')||x.textContent||'').trim()));
    if(!b) return {err:'no Unban'}; b.click(); return {ok:true,l:(b.textContent||'').trim()}; }, VIS);
  await page.waitForTimeout(2000);
  out.confirm = await page.evaluate((v)=>{ const vis=eval(v);
    const ds=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis)
      .filter(x=>[...x.querySelectorAll('button')].filter(vis).length<=8); const d=ds.pop();
    if(!d) return {none:true};
    const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/^Unban/i.test((x.textContent||'').trim()));
    if(!b) return {err:'no confirm', txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,120)};
    b.click(); return {ok:true}; }, VIS);
  await page.waitForTimeout(6000);
  return out;
};
