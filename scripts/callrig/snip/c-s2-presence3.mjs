const WS='W4QCF1XTURESO01', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'load'});
  await page.waitForTimeout(5500);
  await page.locator('button[aria-label$="members"], button[aria-label$="member"]').last().click({timeout:8000});
  await page.waitForTimeout(2500);
  return await page.evaluate(async (ws)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    const r=await fetch(`/api/v1/workspaces/${ws}/presence`,{credentials:'include'}); const j=await r.json();
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    // pair each "Status: X" with the nearest preceding name
    const txt = d? d.innerText.split('\n').map(s=>s.trim()).filter(Boolean):[];
    return {meId: me.id, apiOnline:(j.presences||[]).filter(p=>p.online).map(p=>p.user_id),
      dlgLines: txt.slice(0,40)};
  }, WS);
};
