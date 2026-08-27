export default async ({ page }) => {
  const r = await page.evaluate(async id => {
    const tries = [];
    for (const path of [`/api/v1/meeting/${id}/leave`, `/api/v1/meeting/${id}/participants/leave`]) {
      try { const res = await fetch(path, { method:'POST', credentials:'include' });
        tries.push({ path: path.replace(/^.*\/v1/,''), status: res.status, body: (await res.text()).slice(0,80) }); }
      catch (e) { tries.push({ path, err: String(e).slice(0,40) }); }
    }
    return tries;
  }, process.env.QA_MEETING);
  await page.waitForTimeout(4000);
  return { attempts: r, url: page.url().slice(-26) };
};
