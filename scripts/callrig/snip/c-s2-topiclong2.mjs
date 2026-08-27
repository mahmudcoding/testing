export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(5500);
  const det=page.locator('button[aria-label="Channel details"], button[aria-label="Open channel details"]');
  if(await det.count()){ await det.first().click(); await page.waitForTimeout(1400); }
  const about=page.locator('[role="tab"]').filter({hasText:'About'});
  if(await about.count()){ await about.first().click(); await page.waitForTimeout(1100); }
  const ta=page.locator('textarea').first();
  out.taCount=await ta.count();
  out.maxlength=await ta.evaluate(e=>e.getAttribute('maxlength'));
  const long='QA-S2-TOPICLONG '+'Aloqa channel topic boundary probe. '.repeat(14);
  out.wanted=long.length;
  await ta.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(300);
  await ta.fill(long); await page.waitForTimeout(600);
  out.taValueLen=await ta.evaluate(e=>e.value.length);
  const save=page.locator('button').filter({hasText:'Save'}).first();
  out.saveDisabled=await save.evaluate(e=>e.disabled);
  const reqs=[]; const resps=[];
  const onReq=r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET')
    reqs.push({m:r.method(), u:r.url().split('/api/v1')[1].slice(0,34), len:(r.postData()||'').length}); };
  const onResp=async(r)=>{ if(r.url().includes('/api/v1/channels/')&&r.request().method()!=='GET'){
    let b=''; try{ b=(await r.text()).slice(0,160);}catch(e){}
    resps.push({status:r.status(), body:b}); } };
  page.on('request', onReq); page.on('response', onResp);
  await save.click(); await page.waitForTimeout(3500);
  page.off('request', onReq); page.off('response', onResp);
  out.reqs=reqs; out.resps=resps;
  out.notices=await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')]
    .filter(e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;})
    .map(e=>e.textContent.trim().slice(0,90)));
  out.stored=await page.evaluate(async(ch)=>{
    const j=await (await fetch(`/api/v1/channels/${ch}`,{credentials:'include'})).json();
    return {len:(j.description||'').length, head:(j.description||'').slice(0,36)};
  }, ch);
  return out;
};
