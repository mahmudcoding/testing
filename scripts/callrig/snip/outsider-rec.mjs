export default async ({page}) => {
  await page.goto('https://airion-cargo.store/', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  return await page.evaluate(async(rid)=>{
    const out={origin: location.origin};
    for (const p of [`/api/v1/meeting/recordings/${rid}/content`, `/api/v1/meeting/recordings/${rid}`]) {
      try { const r = await fetch(p, {credentials:'include'});
        out[p] = {status:r.status, type:r.headers.get('content-type'), body:(await r.text()).slice(0,140)};
      } catch(e){ out[p]='ERR '+String(e).slice(0,90); }
    }
    return out;
  }, process.env.QA_RID);
};
