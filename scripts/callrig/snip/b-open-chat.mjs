export default async ({page}) => {
  const url = process.env.QA_URL || 'https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001';
  await page.goto(url, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  return await page.evaluate(() => {
    const msgs = [...document.querySelectorAll('[data-message-id]')];
    const comp = document.querySelector('div[contenteditable="true"]');
    return {
      url: location.pathname,
      vis: document.visibilityState,
      lang: document.documentElement.lang,
      msgCount: msgs.length,
      lastMsgs: msgs.slice(-4).map(m => (m.innerText||'').replace(/\s+/g,' ').slice(0,110)),
      composer: comp ? {label: comp.getAttribute('aria-label'), ph: comp.getAttribute('data-placeholder')} : null,
      headerText: (document.querySelector('header')?.innerText||'').replace(/\s+/g,' ').slice(0,160),
      bodySample: (document.body.innerText||'').replace(/\s+/g,' ').slice(0,300)
    };
  });
};
