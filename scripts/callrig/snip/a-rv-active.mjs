export default async ({ page }) => {
  return await page.evaluate(async () => {
    const ws='W4QAF1XTURESO01';
    const j = async (u) => { try { const r=await fetch(u,{credentials:'include'}); return {s:r.status, b:await r.json().catch(()=>null)}; } catch(e){ return {err:String(e)}; } };
    return { active: await j(`/api/v1/workspace/${ws}/meetings/active`), current: await j('/api/v1/meetings/current') };
  });
};
