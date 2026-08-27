export default async ({ page }) => {
  const startUrl = page.url();
  const found = await page.evaluate((name) => {
    const v = el => { const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
    // find the Live now card carrying the call name, then its Join button
    const cards = [...document.querySelectorAll('div,li,article')].filter(v)
      .filter(e=>(e.innerText||'').includes(name) && (e.innerText||'').length < 300
        && [...e.querySelectorAll('button')].some(b=>/^Join$/i.test((b.innerText||'').trim())));
    const card = cards[cards.length-1];
    if (!card) return { noCard: true };
    const b = [...card.querySelectorAll('button')].filter(v).find(x=>/^Join$/i.test((x.innerText||'').trim()));
    if (!b) return { noJoin: true };
    b.click();
    return { clicked: true, card: card.innerText.replace(/\n+/g,' | ').slice(0,90) };
  }, process.env.QA_CALLNAME || '');
  await page.waitForTimeout(7000);
  return { startUrl: startUrl.slice(-30), found, after: await page.evaluate(() => ({
    url: location.pathname,
    header: (document.body.innerText.match(/[^\n|]*\d+:\d\d[^\n|]*/)||['—'])[0].slice(0,60),
    inCall: !!document.querySelector('[data-testid="call-surface"]') })) };
};
