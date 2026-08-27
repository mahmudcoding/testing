const SP='/private/tmp/claude-501/-Users-mahmud-Projects-testing/23e4646e-5712-4db8-a516-3a788e6f6354/scratchpad';
export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  const net=[];
  page.on('response', async r => { const u=r.url(); if(/file/i.test(u) && r.request().method()!=='GET') net.push({m:r.request().method(),u:u.replace('https://airion-cargo.store',''),s:r.status(),b:(await r.text().catch(()=>'')).slice(0,120)}); });
  await page.goto(`https://airion-cargo.store/w/${WS}/files`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  await page.locator('main button:has-text("Upload")').first().click();
  await page.waitForTimeout(1500);
  const fcp = page.waitForEvent('filechooser', {timeout:15000});
  await page.locator('[role=dialog] button:has-text("Choose files")').first().click();
  const fc = await fcp;
  await fc.setFiles([SP+'/qa-e-image.png', SP+'/qa-e-note.txt']);
  await page.waitForTimeout(2000);
  const staged = await page.evaluate(()=>{const d=document.querySelector('[role=dialog]');
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    return d?{txt:d.innerText.replace(/\n{2,}/g,' | ').slice(0,500), btns:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText).trim()).filter(Boolean)}:null;});
  return {staged, net};
};
