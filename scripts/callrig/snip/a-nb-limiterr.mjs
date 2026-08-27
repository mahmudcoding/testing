import { VIS } from './a-nb-lib.mjs';
const SENT = 'The limit cannot be lower than the number of people already in the call.';
const READ = `(v) => { const vis=eval(v);
  const els=[...document.querySelectorAll('*')].filter(e=>!e.childElementCount)
    .filter(e=>(e.textContent||'').trim()===${JSON.stringify(SENT)});
  return els.map(e=>{const r=e.getBoundingClientRect();
    return {visible:vis(e), box:Math.round(r.width)+'x'+Math.round(r.height),
      tag:e.tagName.toLowerCase(), role:e.getAttribute('role'),
      live:e.getAttribute('aria-live'), cls:String(e.className||'').slice(0,60)};});
}`;
export default async ({page}) => {
  const val = process.env.QA_LIMIT || '3';
  const out={net:[]};
  page.on('response', async r=>{ if(!/\/api\/v1\//.test(r.url()))return; if(r.request().method()==='GET')return;
    out.net.push({m:r.request().method(),s:r.status(),req:(r.request().postData()||'').slice(0,40)}); });
  await page.keyboard.press('Escape').catch(()=>{}); await page.waitForTimeout(800);
  await page.mouse.move(700,500); await page.waitForTimeout(400);
  const t = page.locator('[data-testid="call-controls-settings-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed'))!=='true'){ await t.click(); await page.waitForTimeout(2500); }
  out.before = await page.evaluate(([v,r])=>eval('('+r+')')(v), [VIS, READ]);
  const inp = page.locator('[data-testid="meeting-settings-max-participants-input"]').first();
  await inp.fill(val); await page.waitForTimeout(600);
  await page.locator('[data-testid="meeting-settings-save"]').first().click();
  const seq=[];
  for (let i=0;i<10;i++){ await page.waitForTimeout(700);
    seq.push({ms:(i+1)*700, nodes: await page.evaluate(([v,r])=>eval('('+r+')')(v), [VIS, READ])}); }
  out.seq = seq.filter((x,i)=> i===0 || JSON.stringify(x.nodes)!==JSON.stringify(seq[i-1].nodes));
  return out;
};
