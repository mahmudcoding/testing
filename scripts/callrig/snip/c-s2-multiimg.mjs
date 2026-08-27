export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const files=(process.env.QA_FILES||'').split(',').filter(Boolean);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={};
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let k=0;k<6;k++){
    if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);}
  await page.locator('input[type="file"]').first().setInputFiles(files);
  await page.waitForTimeout(7000);
  out.attached=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const names=[...document.querySelectorAll('*')].filter(v).filter(e=>e.children.length===0)
      .map(e=>(e.textContent||'').trim()).filter(t=>/qa-c2-img\d\.png/.test(t));
    const send=document.querySelector('button[aria-label="Send"]');
    return {chips:[...new Set(names)], sendDisabled:send?!!send.disabled:null};});
  await comp.click(); await page.keyboard.type('QA-MULTIIMG set');
  await page.waitForTimeout(800);
  await page.locator('button[aria-label="Send"]').first().click({timeout:6000}).catch(()=>{out.sendFail=true});
  await page.waitForTimeout(14000);
  out.message=await page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const hit=els.reverse().find(e=>/QA-MULTIIMG/.test(e.innerText||''));
    if(!hit) return 'not found';
    const v=(x)=>{const r=x.getBoundingClientRect();return r.width>3&&r.height>3;};
    return {id:hit.getAttribute('data-message-id'),
      imgs:hit.querySelectorAll('img').length,
      buttons:[...new Set([...hit.querySelectorAll('button')].filter(v)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,30)))].slice(0,10)};});
  return out;
};
