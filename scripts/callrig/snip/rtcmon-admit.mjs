export default async ({page}) => {
  const steps = [];
  // The waiting-room prompt usually surfaces in the people panel or as a toast.
  const found = await page.evaluate(() => {
    const txt = document.body.innerText;
    const hits = [...document.querySelectorAll('button')]
      .map(b=>(b.textContent||b.getAttribute('aria-label')||'').trim())
      .filter(t=>/admit|approve|let in|waiting/i.test(t));
    return { mentionsWaiting: /waiting room|waiting to join|wants to join|approval/i.test(txt), buttons: hits };
  });
  steps.push(JSON.stringify(found));
  if (!found.buttons.length) {
    // open the people panel and look again
    await page.locator('[data-testid="call-controls-people-toggle"]').first().click().catch(()=>{});
    await page.waitForTimeout(2500);
    steps.push(JSON.stringify(await page.evaluate(() => ({
      panel: (document.body.innerText.match(/waiting[\s\S]{0,120}/i)||[''])[0].replace(/\s+/g,' '),
      buttons: [...document.querySelectorAll('button')].map(b=>(b.textContent||b.getAttribute('aria-label')||'').trim())
        .filter(t=>/admit|approve|let in|deny|waiting/i.test(t))
    }))));
  }
  const clicked = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x=>/^(admit|approve|let in)$/i.test((x.textContent||'').trim()));
    if (!b) return 'no admit button';
    b.click(); return 'clicked ' + b.textContent.trim();
  });
  steps.push(clicked);
  await page.waitForTimeout(8000);
  return steps;
};
