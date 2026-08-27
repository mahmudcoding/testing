// ALK-3204: "Company Dashboard briefly shows 'Admin access required' on reload,
// then loads the company info." Shipped in v0.61.0-rc.5. Verify on the deployed build.
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const URL=`https://airion-cargo.store/w/${W}/settings/admin/company`;
  await page.goto(URL, { waitUntil:'networkidle' });
  await page.waitForTimeout(2500);

  const runs=[];
  for (let r=0;r<5;r++){
    const seen=[]; const t0=Date.now();
    const nav = page.reload({ waitUntil:'networkidle' }).catch(()=>{});
    // poll from the instant the reload is issued, uncapped samples
    while (Date.now()-t0 < 9000) {
      let txt='';
      try { txt = await page.evaluate(`(document.body&&document.body.innerText||'').slice(0,4000)`); }
      catch { await page.waitForTimeout(35); continue; }   // context destroyed mid-navigation
      const hasRefusal = /Admin access required/i.test(txt);
      const hasContent = /Company name|Company dashboard|Storage/i.test(txt);
      seen.push({ t: Date.now()-t0, refusal: hasRefusal, content: hasContent });
      if (hasContent && !hasRefusal && Date.now()-t0 > 2500) break;
      await page.waitForTimeout(35);
    }
    await nav;
    const refusalSamples = seen.filter(s=>s.refusal);
    runs.push({
      samples: seen.length,
      refusalSeen: refusalSamples.length,
      refusalWindowMs: refusalSamples.length ? [refusalSamples[0].t, refusalSamples[refusalSamples.length-1].t] : null,
      settledWithContent: seen.length ? seen[seen.length-1].content : null
    });
    await page.waitForTimeout(600);
  }
  return { route:'settings/admin/company', runs };
};
