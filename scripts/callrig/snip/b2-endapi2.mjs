export default async ({ page }) => {
  const out = await page.evaluate(async id => {
    const tries = [];
    for (const [m, path] of [['POST', `/api/v1/meeting/${id}/end`], ['POST', `/api/v1/meeting/${id}/cancel`]]) {
      try { const r = await fetch(path, { method:m, credentials:'include' });
        tries.push({ path: path.replace(/^.*\/v1/,''), status: r.status, body:(await r.text()).slice(0,70) }); }
      catch(e) { tries.push({ path, err:String(e).slice(0,40) }); }
      const chk = await fetch(`/api/v1/meeting/${id}`, {credentials:'include'});
      const t = await chk.text();
      if (/"status":"ended"/.test(t)) { tries.push({ note:'meeting is ended' }); break; }
    }
    return tries;
  }, process.env.QA_MEETING);
  return out;
};
