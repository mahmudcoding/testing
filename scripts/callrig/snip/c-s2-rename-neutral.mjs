const WS='W4QCF1XTURESO01';
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('request', r=>{ const u=r.url();
    if(/\/api\/v1\/channels/.test(u) && ['POST','PATCH'].includes(r.method()))
      reqs.push({m:r.method(), post:(r.postData()||'').slice(0,160)}); });
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/C4QCGENERAL0001`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  // create through the UI form with a neutral name
  await page.locator('button[aria-label="Add channel"]').last().click({timeout:8000});
  await page.waitForTimeout(2000);
  await page.locator('[role="dialog"] input:visible').first().fill('   Project Alpha Two   ');
  await page.waitForTimeout(500);
  await page.locator('[role="dialog"] button:visible').filter({hasText:/^Create$/}).last().click({timeout:8000});
  await page.waitForTimeout(4500);
  out.afterCreate = await page.evaluate(()=>({url:location.href,
    header:(document.querySelector('main')?.innerText||'').replace(/\n+/g,' | ').slice(0,50)}));
  const chId = out.afterCreate.url.split('/c/')[1];
  // rename via Channel details
  await page.locator('button[aria-label="Channel details"]').last().click({timeout:8000});
  await page.waitForTimeout(2500);
  await page.locator('input:visible').first().fill('Project Alpha Two');
  await page.waitForTimeout(500);
  await page.locator('button:visible').filter({hasText:/^Save$/}).last().click({timeout:8000});
  await page.waitForTimeout(3500);
  out.afterRename = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/channels/${ch}`,{credentials:'include'}); const a=await r.json();
    return {apiName:a.name, header:(document.querySelector('main')?.innerText||'').replace(/\n+/g,' | ').slice(0,50),
      sidebar:[...document.querySelectorAll('a')].map(x=>(x.textContent||'').trim()).filter(t=>/Project Alpha|project-alpha/i.test(t))};
  }, chId);
  // slash variant
  await page.locator('input:visible').first().fill('project/alpha?two');
  await page.waitForTimeout(500);
  await page.locator('button:visible').filter({hasText:/^Save$/}).last().click({timeout:8000});
  await page.waitForTimeout(3500);
  out.afterSlashes = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/channels/${ch}`,{credentials:'include'}); const a=await r.json();
    return {apiName:a.name};
  }, chId);
  out.requests = reqs;
  out.channelId = chId;
  return out;
};
