const WS='W4QCF1XTURESO01', CH='C4OWKQTPC7FZ35V';
export default async ({page}) => {
  const out={};
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(5500);
  await page.locator('button[aria-label="Channel details"]').last().click({timeout:8000});
  await page.waitForTimeout(2500);
  const read = () => page.evaluate(async (ch)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const ins=[...document.querySelectorAll('input,textarea')].filter(vis).map(i=>i.value.slice(0,40));
    const r=await fetch(`/api/v1/channels/${ch}`,{credentials:'include'});
    let api=null; try{ api=await r.json(); }catch(e){}
    return {inputs:ins, apiName: api&&api.name, apiTopic: api&&(api.topic??api.description??null),
      header:(document.querySelector('main')?.innerText||'').replace(/\n+/g,' | ').slice(0,80)};
  }, CH);
  out.before = await read();
  await page.locator('input:visible').first().fill('qa-c2-renamed'); await page.waitForTimeout(300);
  await page.locator('input:visible, textarea:visible').filter({has: page.locator('xpath=.')}).nth(1).fill('QA C2 topic line').catch(async()=>{
    await page.locator('input[placeholder="What is this channel about?"]:visible, textarea[placeholder="What is this channel about?"]:visible').first().fill('QA C2 topic line');
  });
  await page.waitForTimeout(300);
  out.typed = await read();
  const saveBtn = page.locator('button:visible').filter({hasText:/^Save$/}).last();
  out.saveDisabled = await saveBtn.isDisabled().catch(()=>null);
  await saveBtn.click({timeout:8000});
  await page.waitForTimeout(3000);
  out.afterSave = await read();
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(5000);
  out.afterReload = await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/channels/${ch}`,{credentials:'include'}); let api=null; try{api=await r.json();}catch(e){}
    const nav=[...document.querySelectorAll('a')].map(a=>(a.textContent||'').trim()).filter(t=>/qa-c2/.test(t));
    return {apiName:api&&api.name, apiTopic:api&&(api.topic??api.description??null),
      header:(document.querySelector('main')?.innerText||'').replace(/\n+/g,' | ').slice(0,80), sidebar:nav};
  }, CH);
  return out;
};
