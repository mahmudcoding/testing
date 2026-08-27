const WS='W4QCF1XTURESO01', CH='C4OWKQTPC7FZ35V';
export default async ({page}) => {
  const out={};
  await page.locator('button[aria-label="Channel details"]').last().click({timeout:8000}).catch(()=>{});
  await page.waitForTimeout(2000);
  const read = () => page.evaluate(async (ch)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const ins=[...document.querySelectorAll('input,textarea')].filter(vis).map(i=>i.value.slice(0,50));
    const r=await fetch(`/api/v1/channels/${ch}`,{credentials:'include'}); let api=null; try{api=await r.json();}catch(e){}
    const nav=[...document.querySelectorAll('a')].map(a=>(a.textContent||'').trim()).filter(t=>/qa.c2|QA C2/i.test(t));
    return {inputs:ins, apiName:api&&api.name,
      header:(document.querySelector('main')?.innerText||'').replace(/\n+/g,' | ').slice(0,70), sidebar:nav};
  }, CH);
  const tryName = async (v) => {
    await page.locator('input:visible').first().fill(v); await page.waitForTimeout(400);
    const btn = page.locator('button:visible').filter({hasText:/^Save$/}).last();
    const dis = await btn.isDisabled().catch(()=>null);
    if (dis) return {input:v, saveDisabled:true, after:await read()};
    await btn.click({timeout:8000}); await page.waitForTimeout(2500);
    return {input:v, saveDisabled:false, after: await read()};
  };
  out.spacesCaps = await tryName('QA C2 Renamed Twice');
  out.slashes    = await tryName('qa/c2\\weird?name');
  out.empty      = await tryName('');
  out.restore    = await tryName('qa-c2-renamed');
  return out;
};
