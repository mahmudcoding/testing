export default async ({ page }) => {
  const out = {};
  out.stopClicked = await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const b = [...document.querySelectorAll('button')].filter(v)
      .find(x=>/stop recording|^Stop$/i.test((x.getAttribute('aria-label')||'')+' '+(x.innerText||'')));
    if (!b) return false; b.click(); return true; });
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const d = [...document.querySelectorAll('[role="dialog"]')].filter(v).pop();
    const b = d && [...d.querySelectorAll('button')].filter(v)
      .find(x=>/^(Stop recording|Stop|Confirm)$/i.test((x.innerText||'').trim()));
    if (b) b.click(); });
  await page.waitForTimeout(8000);
  out.events = await page.evaluate(async (id) => {
    const r = await fetch(`/api/v1/meeting/${id}/events?limit=100`, {credentials:'include'});
    const j = await r.json(); const arr = Array.isArray(j)?j:(j.events||j.data||j.items||[]);
    return arr.filter(e=>(e.event_type||'').startsWith('recording.')).map(e=>e.event_type);
  }, process.env.QA_MEETING);
  return out;
};
