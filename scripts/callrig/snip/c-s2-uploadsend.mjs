export default async ({page}) => {
  const seen=[];
  const onReq=r=>{ if(r.method()!=='GET') seen.push(r.method()+' '+r.url().replace('https://airion-cargo.store','').slice(0,80)); };
  page.on('request', onReq);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await comp.click();
  await comp.type('QA-S2-UPLOADPATH', {delay:30});
  await page.waitForTimeout(400);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(8000);
  page.off('request', onReq);
  return {seen: seen.slice(0,8)};
};
