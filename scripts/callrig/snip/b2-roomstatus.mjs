export default async ({ page }) => {
  return await page.evaluate(async id => {
    const g = async u => { const r = await fetch(u, {credentials:'include'}); return { s:r.status, t:(await r.text()).slice(0,420) }; };
    return { rooms: await g(`/api/v1/meeting/${id}/breakout-rooms`),
             parts: await g(`/api/v1/meeting/${id}/participants`) };
  }, process.env.QA_MEETING);
};
