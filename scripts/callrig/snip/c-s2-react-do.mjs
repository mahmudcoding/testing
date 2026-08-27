export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const id=process.env.QA_MSGID;
  if(!page.url().includes('/c/'+ch)){ await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`); await page.waitForTimeout(6000); }
  const el=page.locator(`[data-message-id="${id}"]`);
  const n=await el.count();
  if(!n) return {err:'message not rendered', id};
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(500);
  const reqs=[];
  const onReq=r=>{ if(r.url().includes('/reactions')) reqs.push(r.method()+' '+(r.postData()||'').slice(0,40)); };
  page.on('request', onReq);
  await el.locator('button[aria-label="Add reaction"]').first().click();
  await page.waitForTimeout(1500);
  const first=page.locator('[role="dialog"] button, [data-radix-popper-content-wrapper] button').nth(3);
  const picked=await first.count()? await first.getAttribute('aria-label'):'none';
  if(await first.count()) await first.click();
  await page.waitForTimeout(2500);
  page.off('request', onReq);
  return {picked, reqs, after: await el.evaluate(e=>[...e.querySelectorAll('button')]
    .map(b=>b.getAttribute('aria-label')).filter(l=>l&&/react/i.test(l)).slice(0,4))};
};
