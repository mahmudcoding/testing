import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const out={net:[]};
  page.on('response', async r=>{ if(r.request().method()==='GET')return; if(!/meeting/i.test(r.url()))return;
    let b=null; try{b=(await r.text()).slice(0,200);}catch(e){}
    out.net.push({m:r.request().method(),s:r.status(),u:r.url().replace(/^https:\/\/[^/]+/,''),req:(r.request().postData()||'').slice(0,150)}); });
  const b = page.locator('[data-testid="meeting-settings-save"]').first();
  out.found = await b.count();
  if (out.found) { await b.click(); await page.waitForTimeout(5000); }
  out.meeting = await page.evaluate(async ()=>{ const id=location.pathname.match(/\/call\/([A-Z0-9]+)/)[1];
    const r=await fetch(`/api/v1/meeting/${id}`,{credentials:'include'}); const t=await r.text();
    const m=t.match(/"requires_approval":(true|false)/); return m?m[1]:t.slice(0,120); });
  return out;
};
