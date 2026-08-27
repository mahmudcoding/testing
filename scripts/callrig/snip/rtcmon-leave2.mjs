export default async ({page}) => {
  const before = await page.evaluate(()=>({
    url: location.pathname,
    dialogs: [...document.querySelectorAll('[role="dialog"]')].map(d=>(d.innerText||'').replace(/\s+/g,' ').slice(0,120)),
  }));
  // Playwright click = a real trusted gesture, unlike element.click()
  const btn = page.locator('[data-testid="call-controls-leave"]').first();
  const n = await btn.count();
  if (n) await btn.click({ timeout: 10000 }).catch(e=>e);
  await page.waitForTimeout(3000);
  const mid = await page.evaluate(()=>({
    dialogs: [...document.querySelectorAll('[role="dialog"]')]
      .filter(d=>d.offsetParent)
      .map(d=>({ text:(d.innerText||'').replace(/\s+/g,' ').slice(0,160),
                 buttons:[...d.querySelectorAll('button')].map(b=>(b.textContent||'').trim()).filter(Boolean) })),
  }));
  return { before, btnCount:n, mid };
};
