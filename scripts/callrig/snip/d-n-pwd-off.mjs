export default async ({page}) => {
  const id=process.env.QA_MID;
  const out={};
  const s = page.locator('[data-testid="call-controls-settings-toggle"]').first();
  if (await s.getAttribute('aria-pressed')!=='true'){ const b=await s.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(2500); }
  const tog = page.locator('[data-testid="meeting-settings-password-toggle"]').first();
  out.before = await tog.getAttribute('aria-checked');
  if (out.before==='true'){ const b=await tog.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(1200); }
  out.after = await tog.getAttribute('aria-checked');
  const save = page.locator('[data-testid="meeting-settings-save"]').first();
  out.saveDis = await save.isDisabled();
  if(!out.saveDis){ const b=await save.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(4000); }
  out.server = await page.evaluate(async(id)=>{const r=await fetch(`/api/v1/meeting/${id}`,{credentials:'include'});
    const j=JSON.parse(await r.text()).meeting; return {password_protected:j.password_protected, requires_approval:j.requires_approval};}, id);
  out.toasts = await page.evaluate(()=>[...document.querySelectorAll('[data-sonner-toast]')].map(t=>(t.innerText||'').replace(/\s+/g,' ').slice(0,100)));
  return out;
};
