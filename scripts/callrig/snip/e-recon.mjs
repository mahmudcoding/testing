export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  // force English
  await page.goto(`https://airion-cargo.store/w/${WS}/directories`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(2500);
  const out = await page.evaluate(async () => {
    const vis = e => { const r=e.getBoundingClientRect(); return r.width>0&&r.height>0; };
    const tabs = [...document.querySelectorAll('[role=tab],button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(t=>t&&t.length<40).slice(0,45);
    return {
      title: document.title,
      vis: document.visibilityState,
      lang: document.documentElement.lang,
      h: (document.querySelector('main h1,main h2')||{}).innerText,
      tabs
    };
  });
  return out;
};
