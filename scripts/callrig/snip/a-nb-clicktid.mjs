import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const tid = process.env.QA_TID;
  const out={tid, net:[]};
  page.on('response', async r=>{ if(!/\/api\/v1\//.test(r.url()))return; if(r.request().method()==='GET')return;
    out.net.push({m:r.request().method(),s:r.status(),u:r.url().replace(/^https:\/\/[^/]+/,'')}); });
  await page.mouse.move(700,400); await page.waitForTimeout(500);
  const b = page.locator(`[data-testid="${tid}"]`).first();
  out.found = await b.count();
  if (!out.found) return out;
  const box = await b.boundingBox(); out.box=box;
  await page.mouse.click(box.x+box.width/2, box.y+box.height/2);
  await page.waitForTimeout(4000);
  out.state = await page.evaluate((v)=>{ const vis=eval(v);
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return {mainPressed:(document.querySelector('[data-testid="header-tab-main-activate"]')||{}).getAttribute
              ? document.querySelector('[data-testid="header-tab-main-activate"]').getAttribute('aria-pressed'):null,
      mainAudioTrigger: !!document.querySelector('[data-testid="main-audio-trigger"]'),
      dlg:[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(vis)
            .filter(d=>d.getAttribute('data-testid')!=='call-overlay-expanded')
            .map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,110)),
      tiles:[...ov.querySelectorAll('[data-testid="participant-tile"]')].filter(vis)
            .map(t=>((t.querySelector('[data-testid="participant-name"]')||{}).textContent||'').trim()+':'
                 +Math.round(t.getBoundingClientRect().width))}; }, VIS);
  return out;
};
