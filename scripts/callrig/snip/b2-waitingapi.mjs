export default async ({ page }) => {
  const id = process.env.QA_MEETING;
  return await page.evaluate(async (id) => {
    const r = await fetch(`/api/v1/meeting/${id}/waiting`, {credentials:'include'});
    return { status: r.status, body: await r.text() };
  }, id);
};
