export default async ({page}) => {
  const out={};
  const want = process.env.QA_PWON === '1';
  out.before = await page.evaluate(()=>{ const b=document.querySelector('[data-testid="meeting-settings-password-toggle"]'); return b? b.getAttribute('aria-checked'):'not-found'; });
  if (String(out.before) !== String(want)) {
    await page.evaluate(()=>{ const b=document.querySelector('[data-testid="meeting-settings-password-toggle"]'); if(b) b.click(); });
    await page.waitForTimeout(1500);
  }
  out.mid = await page.evaluate(()=>{ const b=document.querySelector('[data-testid="meeting-settings-password-toggle"]'); return b? b.getAttribute('aria-checked'):null; });
  if (want) {
    const pw = await page.$('[role=dialog] input[type=password], aside input[type=password]');
    out.pwField = !!pw;
    if (pw) { await pw.fill(process.env.QA_PW || 'Secret123'); await page.waitForTimeout(600); }
  }
  out.saved = await page.evaluate(()=>{ const b=document.querySelector('[data-testid="meeting-settings-save"]'); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(5000);
  out.after = await page.evaluate(async()=>{
    const id=(location.pathname.match(/\/call\/([A-Za-z0-9]+)/)||[])[1];
    const j=await (await fetch(`/api/v1/meeting/${id}`,{credentials:'include'})).json().catch(()=>null); const m=j&&(j.meeting||j);
    return {id, pw:m&&m.password_protected, appr:m&&m.requires_approval, at:new Date().toISOString()};
  });
  return out;
};
