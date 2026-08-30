export default async ({page}) => {
  const tid=process.env.QA_TID, id=process.env.QA_MID;
  const out={};
  const s = page.locator('[data-testid="call-controls-settings-toggle"]').first();
  if (await s.getAttribute('aria-pressed')!=='true'){ await s.click(); await page.waitForTimeout(2500); }
  const b = page.locator(`[data-testid="${tid}"]`).first();
  out.found = await b.count();
  if(!out.found) return out;
  out.before = await b.getAttribute('aria-checked');
  out.clickAt = Date.now();
  await b.click();
  await page.waitForTimeout(3000);
  out.after = await b.getAttribute('aria-checked');
  out.settings = await page.evaluate(async(id)=>{const r=await fetch(`/api/v1/meeting/${id}/settings`,{credentials:'include'}); return (await r.text()).slice(0,400);}, id);
  out.toasts = await page.evaluate(()=>[...document.querySelectorAll('[data-sonner-toast]')].map(t=>(t.innerText||'').replace(/\s+/g,' ').slice(0,100)));
  return out;
};
