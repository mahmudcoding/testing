const WS='W4QCF1XTURESO01', CH='C4OWKQTPC7FZ35V', GEN='C4QCGENERAL0001';
export default async ({page}) => {
  const out={};
  const reqs=[];
  page.on('request', r => { if (/\/api\/v1\/channels\//.test(r.url()) && ['PATCH','PUT','POST'].includes(r.method()))
      reqs.push({m:r.method(), u:r.url().slice(-46), post:(r.postData()||'').slice(0,160)}); });
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(5500);
  await page.locator('button[aria-label="Channel details"]').last().click({timeout:8000});
  await page.waitForTimeout(2200);
  await page.locator('input:visible').first().fill('QA C2 Second Check');
  await page.waitForTimeout(400);
  await page.locator('button:visible').filter({hasText:/^Save$/}).last().click({timeout:8000});
  await page.waitForTimeout(3000);
  out.requests = reqs;
  out.after = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/channels/${ch}`,{credentials:'include'}); let a=null; try{a=await r.json();}catch(e){}
    return {apiName:a&&a.name, header:(document.querySelector('main')?.innerText||'').replace(/\n+/g,' | ').slice(0,60),
      sidebar:[...document.querySelectorAll('a')].map(x=>(x.textContent||'').trim()).filter(t=>/QA C2|qa-c2/i.test(t))};
  }, CH);
  // consequence: does # in the composer offer channels, and what does it insert?
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${GEN}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').last();
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200);
  await page.keyboard.type('#QA C2');
  await page.waitForTimeout(1800);
  out.hashAutocomplete = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const pops=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role="listbox"],[role="menu"]')].filter(vis);
    return {popups:pops.length, text: pops.map(p=>p.innerText.replace(/\n+/g,' | ').slice(0,140))};
  });
  await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  return out;
};
