export default async ({ page }) => {
  if (!/airion-cargo/.test(page.url())) { await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/chat/mentions',{waitUntil:'domcontentloaded'}); await page.waitForTimeout(3000); }
  return await page.evaluate(async () => {
    const j = async (u) => { try { const r = await fetch(u,{credentials:'include'}); return {s:r.status, b:await r.json().catch(()=>null)}; } catch(e){ return {err:String(e).slice(0,80)}; } };
    const me = await j('/api/v1/auth/me');
    const pres = await j('/api/v1/workspaces/W4QAF1XTURESO01/presence');
    const pick = (o) => { const arr = Array.isArray(o?.b) ? o.b : (o?.b?.data ?? o?.b?.presence ?? o?.b?.items ?? []);
      return Array.isArray(arr) ? arr.map(x=>({u:x.user_id??x.userId??x.id, st:x.status??x.state??x.presence, on:x.online??x.is_online})) : o?.b; };
    return { who: me.b?.email ?? me.b?.data?.email, presenceStatus: pres.s, presence: pick(pres) };
  });
};
