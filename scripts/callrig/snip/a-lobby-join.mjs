export default async ({page}) => {
  const dlg = page.locator('[role="dialog"] button:has-text("Join")').last();
  if (await dlg.count()) { await dlg.click(); }
  else { const b = page.locator('button:has-text("Join")').last(); if (await b.count()) await b.click(); }
  await page.waitForTimeout(9000);
  return await page.evaluate(async () => {
    const cur = await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();
    const m = document.querySelector('main')||document.body;
    return {url: location.href, inCall: !!(cur.meeting), meeting: cur.meeting ? {id:cur.meeting.id,name:cur.meeting.name,status:cur.meeting.status} : null,
            toolbar: [...m.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(Boolean).slice(0,18)};
  });
};
