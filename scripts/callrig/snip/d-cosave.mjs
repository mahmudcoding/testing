export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const res={reqs:[]};
  page.on('request', r=>{ if(r.url().includes('/api/v1/')&&r.method()!=='GET') res.reqs.push(r.method()+' '+r.url().replace('https://airion-cargo.store','').slice(0,55)); });
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/company`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const allBtns = () => page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0).map(b=>((b.innerText||'').trim()||b.getAttribute('aria-label')||'?').slice(0,26)));
  res.clean = await allBtns();
  // find the company-name input structurally and make the form dirty
  const inp = page.locator('main input').filter({hasNot:page.locator('[placeholder="Filter settings"]')}).last();
  res.inputCount = await page.locator('main input').count();
  await inp.fill('QA Fixtures D edited');
  await page.waitForTimeout(2000);
  res.dirty = await allBtns();
  res.dirtyOnly = res.dirty.filter(b=>!res.clean.includes(b));
  res.fieldValue = await page.evaluate(()=>{const i=[...document.querySelectorAll('main input')].pop(); return i?i.value:null;});
  // discard by reloading — do NOT save
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  res.nameAfter = await page.evaluate(async()=>{const r=await fetch('/api/v1/companies/O4QDF1XTURESO01',{credentials:'include'});const j=await r.json();return j.name;});
  return res;
};
