export default async ({page}) => {
  const id=process.env.QA_MID, nm=process.env.QA_NAME||'DN-NAME-1';
  const out={};
  const g = async ()=> await page.evaluate(async(id)=>{const r=await fetch(`/api/v1/meeting/${id}`,{credentials:'include'});
    const j=JSON.parse(await r.text()).meeting; return {password_protected:j.password_protected, requires_approval:j.requires_approval, name:j.name, max_participants:j.max_participants};}, id);
  // close then reopen the panel, to read the persisted state rather than the in-memory form
  const t = page.locator('[data-testid="call-controls-settings-toggle"]').first();
  if (await t.getAttribute('aria-pressed')==='true'){ await t.click(); await page.waitForTimeout(1200); }
  await t.click(); await page.waitForTimeout(2500);
  out.reopened = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="meeting-settings-panel"]');
    return {pwdToggle:p.querySelector('[data-testid="meeting-settings-password-toggle"]')?.getAttribute('aria-checked'),
      pwdInputPresent: !!p.querySelector('[data-testid="meeting-settings-password-input"]'),
      pwdVal: p.querySelector('[data-testid="meeting-settings-password-input"]')?.value ?? null,
      pwdPlaceholder: p.querySelector('[data-testid="meeting-settings-password-input"]')?.placeholder ?? null,
      whoOpen: p.querySelector('[data-testid="meeting-settings-entry-open"]')?.getAttribute('aria-checked'),
      whoAdmit: p.querySelector('[data-testid="meeting-settings-entry-manual_admit"]')?.getAttribute('aria-checked')};
  });
  out.before = await g();
  // change only the name
  const nf = page.locator('[data-testid="meeting-settings-name-input"]').first();
  await nf.click(); await nf.fill(nm); await page.waitForTimeout(500);
  out.nameTyped = await nf.inputValue();
  const save = page.locator('[data-testid="meeting-settings-save"]').first();
  out.saveDisabled = await save.isDisabled();
  if(!out.saveDisabled){ await save.click(); await page.waitForTimeout(4000); }
  out.after = await g();
  out.toasts = await page.evaluate(()=>[...document.querySelectorAll('[data-sonner-toast]')].map(t=>(t.innerText||'').replace(/\s+/g,' ').slice(0,100)));
  return out;
};
