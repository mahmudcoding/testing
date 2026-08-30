export default async ({page}) => {
  const id=process.env.QA_MID, pw=process.env.QA_PW||'Secret123!';
  const out={};
  const g = async ()=> await page.evaluate(async(id)=>{const r=await fetch(`/api/v1/meeting/${id}`,{credentials:'include'});const t=await r.text();
    const j=JSON.parse(t).meeting; return {password_protected:j.password_protected, requires_approval:j.requires_approval, name:j.name, is_private:j.is_private, max_participants:j.max_participants};}, id);
  out.before = await g();
  const tog = page.locator('[data-testid="meeting-settings-password-toggle"]').first();
  out.togState0 = await tog.getAttribute('aria-checked');
  await tog.click(); await page.waitForTimeout(1500);
  out.togState1 = await tog.getAttribute('aria-checked');
  out.panelAfterToggle = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="meeting-settings-panel"]');
    return {text:(p.innerText||'').replace(/\s+/g,' ').slice(0,700),
      inputs:[...p.querySelectorAll('input')].map(i=>({tid:i.dataset.testid||null,type:i.type,ph:i.placeholder,v:String(i.value).slice(0,20)}))};
  });
  // fill the password field
  const pf = page.locator('[data-testid="meeting-settings-panel"] input[type="password"], [data-testid="meeting-settings-panel"] input[placeholder*="assword"]').first();
  out.pfCount = await pf.count();
  if (out.pfCount){ await pf.click(); await pf.fill(pw); await page.waitForTimeout(400); out.pfVal = await pf.inputValue(); }
  const save = page.locator('[data-testid="meeting-settings-save"]').first();
  out.saveDisabled = await save.isDisabled();
  if (!out.saveDisabled){ await save.click(); await page.waitForTimeout(4000); }
  out.after = await g();
  out.panelAfterSave = await page.evaluate(()=>{
    const p=document.querySelector('[data-testid="meeting-settings-panel"]');
    return p?(p.innerText||'').replace(/\s+/g,' ').slice(0,500):null;});
  return out;
};
