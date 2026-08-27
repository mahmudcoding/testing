export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/admin/members`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const me = await page.evaluate(async()=> (await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()));
  const rows = await page.evaluate(() => {
    const out=[];
    document.querySelectorAll('tr').forEach(tr=>{
      const t=(tr.innerText||'').replace(/\s+/g,' ').trim();
      if(!t) return;
      const acts=[]; tr.querySelectorAll('button').forEach(b=>{const r=b.getBoundingClientRect(); if(r.width>0&&r.height>0) acts.push({label:((b.innerText||'').trim()||b.getAttribute('aria-label')||'?').slice(0,26), disabled:b.disabled||b.getAttribute('aria-disabled')==='true'});});
      out.push({row:t.slice(0,110), acts});
    });
    return out;
  });
  return {me:{email:me.email, id:me.id||me.user_id}, rows};
};
