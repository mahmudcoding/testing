export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/chat', { waitUntil:'networkidle' });
  await page.waitForTimeout(2200);
  return await page.evaluate(async () => {
    const W='W4QDF1XTURESO01';
    const r=await fetch(`/api/v1/workspaces/${W}/presence`,{credentials:'include'});
    const j=await r.json(); const arr=j.presences||[];
    const pick=id=>{ const p=arr.find(x=>x.user_id===id); return p?{online:p.online, last_seen:!!p.last_seen_at}:null; };
    return { alice:pick('U4QDALICE000001'), bob:pick('U4QDBOB00000001'), admin:pick('U4QDADMIN000001') };
  });
};
