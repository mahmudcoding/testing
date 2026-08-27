export default async ({page}) => {
  const out = [];
  for (const tid of ['call-controls-people-toggle','call-controls-chat-toggle','call-controls-settings-toggle','call-controls-breakout-rooms']) {
    const l = page.locator('[data-testid="'+tid+'"]');
    if (await l.count() && await l.getAttribute('aria-pressed') === 'true') { await l.click(); await page.waitForTimeout(900); out.push('closed '+tid); }
  }
  await page.waitForTimeout(1000);
  const st = await page.evaluate(()=>({
    open: ['call-controls-people-toggle','call-controls-chat-toggle','call-controls-settings-toggle','call-controls-breakout-rooms']
      .map(t=>{const e=document.querySelector('[data-testid="'+t+'"]'); return t+'='+(e?e.getAttribute('aria-pressed'):'n/a');})
  }));
  return {out, st};
};
