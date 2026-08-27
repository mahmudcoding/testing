export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const list = await page.evaluate(() => {
    const m = document.querySelector('main')||document.body;
    const hits = [...m.querySelectorAll('*')].filter(e=>/QA-A-SCHED3/.test(e.textContent||'') && e.children.length<=3)
      .map(e=>({tag:e.tagName, tid:e.getAttribute('data-testid'), t:(e.innerText||'').replace(/\n+/g,' | ').slice(0,90)}));
    return {url: location.href, hits: hits.slice(0,4), text: m.innerText.replace(/\n+/g,' | ').slice(0,300)};
  });
  const ev = page.locator('main :text("QA-A-SCHED3")').first();
  let after = null;
  if (await ev.count()) { await ev.click(); await page.waitForTimeout(3000);
    after = await page.evaluate(()=>{ const d=[...document.querySelectorAll('[role="dialog"]')].pop();
      return d? {t: d.innerText.replace(/\n+/g,' | ').slice(0,400), btns:[...d.querySelectorAll('button,a')].map(b=>((b.getAttribute('aria-label')||b.textContent||'').trim()).slice(0,26)).filter(Boolean)} : {none:true, url:location.href};});
  }
  return {list, after};
};
