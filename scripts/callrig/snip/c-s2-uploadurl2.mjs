const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7500);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  for(let i=0;i<6;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(200); }
  const seen=[];
  const onReq=r=>{ if(r.method()!=='GET') seen.push(r.method()+' '+r.url().replace('https://airion-cargo.store','')); };
  page.on('request', onReq);
  const inp=page.locator('input[type=file]').first();
  const cnt=await inp.count();
  await inp.setInputFiles(`${DIR}/qa-s2-v3.png`);
  await page.waitForTimeout(6000);
  page.off('request', onReq);
  const pend=await page.evaluate(()=>[...document.querySelectorAll('body *')]
    .filter(e=>e.children.length===0&&/qa-s2-v3\.png/.test(e.textContent||''))
    .map(e=>e.textContent.trim().slice(0,40)));
  return {inputs:cnt, seen:seen.slice(0,6), pendingLabels:pend.slice(0,3)};
};
