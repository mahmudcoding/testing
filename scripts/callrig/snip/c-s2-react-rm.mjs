export default async ({page}) => {
  const id=process.env.QA_MSGID;
  const el=page.locator(`[data-message-id="${id}"]`);
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(400);
  const b=el.locator('button[aria-label="Remove 🔥 reaction"]');
  if(!await b.count()) return {err:'no remove chip'};
  const reqs=[];
  const onReq=r=>{ if(r.url().includes('/reactions')) reqs.push(r.method()); };
  page.on('request', onReq);
  await b.first().click(); await page.waitForTimeout(2500);
  page.off('request', onReq);
  return {reqs, after: await el.evaluate(e=>[...e.querySelectorAll('button')]
    .map(x=>({l:x.getAttribute('aria-label'), t:(x.textContent||'').trim().slice(0,8)}))
    .filter(x=>x.l&&/react/i.test(x.l)).slice(0,3))};
};
