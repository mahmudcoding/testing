export default async ({page}) => {
  const id=process.env.QA_MSGID;
  const el=page.locator(`[data-message-id="${id}"]`);
  if(!await el.count()) return {err:'not rendered'};
  await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(400);
  const b=el.locator('button[aria-label="React with 🔥"]');
  const n=await b.count();
  if(!n) return {err:'no React with chip', labels: await el.evaluate(e=>[...e.querySelectorAll('button')]
    .map(x=>x.getAttribute('aria-label')).filter(Boolean).slice(0,8))};
  const reqs=[];
  const onReq=r=>{ if(r.url().includes('/reactions')) reqs.push(r.method()+' '+(r.postData()||'').slice(0,30)); };
  page.on('request', onReq);
  await b.first().click(); await page.waitForTimeout(2500);
  page.off('request', onReq);
  return {reqs, after: await el.evaluate(e=>[...e.querySelectorAll('button')]
    .map(x=>({l:x.getAttribute('aria-label'), t:(x.textContent||'').trim().slice(0,8)}))
    .filter(x=>x.l&&/react/i.test(x.l)).slice(0,4))};
};
