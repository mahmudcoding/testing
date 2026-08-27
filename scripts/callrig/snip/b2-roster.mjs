export default async ({ page }) => {
  return await page.evaluate(async (id) => {
    const ws='W4QBF1XTURESO01';
    const g = async u => { const r = await fetch(u,{credentials:'include'}); return {s:r.status, t:(await r.text()).slice(0,700)}; };
    return { participants: await g(`/api/v1/meeting/${id}/participants`),
             active: await g(`/api/v1/workspace/${ws}/meetings/active`) };
  }, process.env.QA_MEETING);
};
