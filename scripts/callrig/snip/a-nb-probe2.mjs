export default async ({page}) => {
  const u = process.env.QA_URL;
  return await page.evaluate(async (url) => {
    const r = await fetch(url, {credentials:'include'});
    const t = await r.text();
    try { return {s:r.status, j: JSON.parse(t)}; } catch(e) { return {s:r.status, t: t.slice(0,800)}; }
  }, u);
}
