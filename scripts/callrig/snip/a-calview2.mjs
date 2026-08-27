export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  const info = await page.evaluate(() => {
    const m = document.querySelector('main')||document.body;
    const all = [...m.querySelectorAll('*')].filter(e=>/QA-A-SCHED3/.test(e.textContent||''));
    const smallest = all.filter(e=>(e.innerText||'').length < 120).map(e=>({tag:e.tagName, tid:e.getAttribute('data-testid'), cls:(e.className||'').toString().slice(0,50), t:(e.innerText||'').replace(/\n+/g,' | ')}));
    return {count: all.length, smallest: smallest.slice(0,5)};
  });
  let opened = null;
  const chip = page.locator('main *').filter({hasText:/^QA-A-SCHED3/}).last();
  if (await chip.count()) {
    try { await chip.click({timeout:5000}); await page.waitForTimeout(3000);
      opened = await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].pop();
        return d? {t:d.innerText.replace(/\n+/g,' | ').slice(0,450), btns:[...d.querySelectorAll('button,a')].map(b=>((b.getAttribute('aria-label')||b.textContent||'').trim()).slice(0,28)).filter(Boolean)} : {none:true};});
    } catch(e) { opened = {err: String(e).slice(0,90)}; }
  }
  return {info, opened};
};
