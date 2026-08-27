export default async ({ page }) => {
  const id = process.env.QA_CALL;
  return await page.evaluate(async (id) => {
    const r = await fetch(`/api/v1/meeting/${id}/my-permissions`, {credentials:'include'});
    return { status: r.status, body: await r.json().catch(()=>null) };
  }, id);
};
