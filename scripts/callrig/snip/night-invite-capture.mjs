export default async ({page}) => {
  const who=process.env.QA_WHO||'QA Alice';
  const reqs=[];
  const onResp=async(r)=>{ const u=r.url();
    if(/\/api\/v1\//.test(u) && r.request().method()!=='GET'){
      let b=''; try{ b=(await r.text()).slice(0,160);}catch(e){}
      reqs.push({m:r.request().method(), u:u.replace(/^https:\/\/[^/]+/,''), s:r.status(), body:b,
                 post:(r.request().postData()||'').slice(0,160)});
    }};
  page.on('response', onResp);
  const ms=await page.$$('[role="dialog"]');
  const m=ms[ms.length-1];
  if(m){
    const rows=await m.$$('label');
    for(const r of rows){ const t=((await r.innerText())||'').replace(/\s+/g,' ').trim();
      if(t.includes(who) && !t.includes('In call')){ try{ await r.click(); }catch(e){} break; } }
    await page.waitForTimeout(1200);
    const btns=await m.$$('button');
    for(const b of btns){ const l=((await b.innerText())||'').trim();
      if(/^Invite \(\d+\)$/.test(l) && !(await b.isDisabled())){ await b.click(); break; } }
  }
  await page.waitForTimeout(5000);
  page.off('response', onResp);
  return {reqs};
};
