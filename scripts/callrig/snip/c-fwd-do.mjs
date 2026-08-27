export default async ({page}) => {
  const d2 = page.locator('[role=dialog]').last();
  const ce = d2.locator('[contenteditable="true"]').last();
  await ce.click(); await page.waitForTimeout(300);
  await ce.type('QA-C-FWD-COMMENT');
  await page.waitForTimeout(400);
  await d2.locator('button', {hasText:/^Send$/}).first().click();
  await page.waitForTimeout(3000);
  const dialogsLeft = await page.locator('[role=dialog]').count();
  // read qa-private via API
  const api = await page.evaluate(async () => {
    const r = await fetch('/api/v1/messaging/channels/C4QCPRIVATE0001/messages?limit=5',{credentials:'include'});
    const j = await r.json();
    const arr = j.messages||j.data||j;
    return (Array.isArray(arr)?arr:[]).slice(0,3).map(m=>({id:m.id, body:m.body, type:m.type, fwd:m.forwarded_from||m.forward||m.forwarded||null, attachments:(m.attachments||[]).length}));
  });
  return {dialogsLeft, url: page.url(), privateTop: api};
};
