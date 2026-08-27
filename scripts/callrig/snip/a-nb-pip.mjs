import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const out = {};
  const snap = async (tag) => await page.evaluate((v)=>{ const vis=eval(v);
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]');
    const anyCall=[...document.querySelectorAll('[data-testid*="call-"]')].filter(vis)
      .map(x=>x.getAttribute('data-testid')).slice(0,12);
    return {path:location.pathname,
      overlayPresent: !!ov, overlayVisible: ov?vis(ov):false,
      pip: !!document.pictureInPictureElement,
      docPiP: !!(window.documentPictureInPicture && window.documentPictureInPicture.window),
      callTestids:[...new Set(anyCall)],
      videos:[...document.querySelectorAll('video')].filter(vis).map(x=>({w:x.videoWidth,h:x.videoHeight,src:!!x.srcObject})),
      buttons:[...document.querySelectorAll('button')].filter(vis)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,34)).filter(Boolean).slice(0,28)}; }, VIS);
  out.before = await snap('before');
  const b = page.locator('[data-testid="call-surface-minimize"]').first();
  out.btn = await b.count() ? await b.getAttribute('aria-label') : null;
  if (!out.btn) return out;
  await b.click();
  await page.waitForTimeout(6000);
  out.after = await snap('after');
  return out;
}
