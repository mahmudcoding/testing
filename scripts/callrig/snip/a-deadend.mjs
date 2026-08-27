export default async ({page}) => {
  const id = process.env.QA_MEET;
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/call/'+id, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  return await page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
      return r.width>2 && r.height>2 && s.visibility!=='hidden' && s.display!=='none'; };
    // the page area only, excluding the app chrome/sidebar
    const main = document.querySelector('main') || document.body;
    const inMain = [...main.querySelectorAll('button,a')].filter(vis).map(e=>((e.getAttribute('aria-label')||e.textContent||'').trim()||'(no label)').slice(0,30));
    return {url: location.href, mainText: main.innerText.replace(/\n+/g,' | ').slice(0,300), controlsInMain: inMain};
  });
};
