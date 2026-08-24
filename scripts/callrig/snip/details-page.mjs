export default async ({page}) => {
  await page.waitForTimeout(2500);
  return await page.evaluate(() => {
    const m = document.querySelector('main')||document.body;
    return {url: location.href,
      text: m.innerText.replace(/\n+/g,' | ').slice(0,1400),
      tabs: [...m.querySelectorAll('[role="tab"],button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,36)}#${b.getAttribute('data-testid')||'-'}${b.getAttribute('aria-selected')?'|sel='+b.getAttribute('aria-selected'):''}`).slice(0,30),
      media: [...m.querySelectorAll('video,audio')].map(v=>({tag:v.tagName, src:(v.currentSrc||v.src||'').slice(0,120), dur:v.duration, paused:v.paused, err:v.error?v.error.code:null, w:v.videoWidth, h:v.videoHeight}))};
  });
};
