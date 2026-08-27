export default async ({ page }) => {
  const id = process.env.QA_MEETING;
  const r = await page.evaluate(async (id) => {
    const res = await fetch(`/api/v1/meeting/${id}/events?limit=200`, {credentials:'include'});
    return await res.text();
  }, id);
  let j; try { j = JSON.parse(r); } catch { return { raw: r }; }
  const arr = Array.isArray(j) ? j : (j.events || j.data || j.items || []);
  const keys = new Set();
  const walk = (o, p='') => { if (o && typeof o === 'object' && !Array.isArray(o))
    for (const k of Object.keys(o)) { keys.add(p+k); walk(o[k], p+k+'.'); } };
  arr.forEach(e => walk(e));
  return { n: arr.length, topKeys: [...keys], sample: arr.filter(e=>/joined|left/.test(JSON.stringify(e))).slice(0,2) };
};
