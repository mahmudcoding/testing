export default async ({page}) => {
  const out={};
  // open Meeting settings only if it is not already open
  out.toggleState = await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-controls-settings-toggle"]'); return b? b.getAttribute('aria-pressed'):'no-toggle'; });
  if (out.toggleState !== 'true') {
    await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-controls-settings-toggle"]'); if(b) b.click(); });
    await page.waitForTimeout(3500);
  }
  out.pwBefore = await page.evaluate(()=>{ const b=document.querySelector('[data-testid="meeting-settings-password-toggle"]'); return b? b.getAttribute('aria-checked'):'not-found'; });
  if (out.pwBefore === 'not-found') return out;
  if (out.pwBefore === 'true') {
    await page.evaluate(()=>{ const b=document.querySelector('[data-testid="meeting-settings-password-toggle"]'); if(b) b.click(); });
    await page.waitForTimeout(1500);
  }
  out.pwMid = await page.evaluate(()=>{ const b=document.querySelector('[data-testid="meeting-settings-password-toggle"]'); return b? b.getAttribute('aria-checked'):null; });
  out.saved = await page.evaluate(()=>{ const b=document.querySelector('[data-testid="meeting-settings-save"]'); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(6000);
  out.server = await page.evaluate(async()=>{
    const id=(location.pathname.match(/\/call\/([A-Za-z0-9]+)/)||[])[1];
    const j=await (await fetch(`/api/v1/meeting/${id}`,{credentials:'include'})).json().catch(()=>null); const m=j&&(j.meeting||j);
    return {id, password_protected:m&&m.password_protected, at:new Date().toISOString()};
  });
  return out;
};
