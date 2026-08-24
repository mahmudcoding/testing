export default async ({page}) => {
  return await page.evaluate(() => {
    const surface = document.querySelector('[role="dialog"]') || document.body;
    return {
      videos: [...surface.querySelectorAll('video')].map(v=>({lbl:(v.closest('[aria-label]')||{}).getAttribute?.('aria-label'), vw:v.videoWidth})),
      thumbStrip: !!surface.querySelector('[data-testid="screen-share-thumbnails"]'),
      thumbCount: surface.querySelectorAll('[data-testid="screen-share-thumbnail"]').length,
      buttons: [...surface.querySelectorAll('button')].map(b=>`${(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,42)}#${b.getAttribute('data-testid')||'-'}`).filter(x=>!/^#-$/.test(x)).slice(0,30),
      text: surface.innerText.replace(/\n+/g,' | ').slice(0,300)
    };
  });
};
