import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const name = process.env.QA_NEWNAME || 'RENAMED';
  const out={net:[]};
  page.on('response', async r=>{ if(r.request().method()==='GET')return; if(!/meeting/i.test(r.url()))return;
    out.net.push({m:r.request().method(),s:r.status(),u:r.url().replace(/^https:\/\/[^/]+/,''),req:(r.request().postData()||'').slice(0,120)}); });
  const t = page.locator('[data-testid="call-controls-settings-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed'))!=='true'){ await t.click(); await page.waitForTimeout(2500); }
  const fld = await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const es=[...p.querySelectorAll('input,textarea')].filter(vis)
      .map((e,i)=>({i, l:e.getAttribute('aria-label')||e.getAttribute('placeholder')||e.type, val:e.value}));
    return es; }, VIS);
  out.fields = fld;
  const inp = page.locator('[data-testid="call-side-panel-slot"] input').first();
  if (await inp.count()) { await inp.fill(name); await page.waitForTimeout(600); }
  const s = page.locator('[data-testid="meeting-settings-save"]').first();
  out.save = await s.count(); if (out.save) { await s.click(); await page.waitForTimeout(5000); }
  return out;
};
