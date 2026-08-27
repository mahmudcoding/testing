export default async ({ page }) => {
  const want = process.env.QA_CALLNAME;
  const api = await page.evaluate(async id => {
    const r = await fetch(`/api/v1/meeting/${id}`, {credentials:'include'});
    const t = await r.text(); const m = t.match(/"name":"((?:[^"\\]|\\.)*)"/);
    return m ? m[1] : 'none'; }, process.env.QA_MEETING);
  const header = await page.evaluate(() => {
    const s = document.querySelector('[data-testid="call-surface"]');
    return s ? (s.innerText||'').split('\n')[0].slice(0,60) : 'no surface'; });
  return { wanted: want, apiRaw: api, callHeader: header,
           headerMatches: header.includes(want) };
};
