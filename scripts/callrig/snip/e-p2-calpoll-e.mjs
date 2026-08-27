export default async ({page}) => {
  const out=[];
  for (let i=0;i<8;i++){
    out.push(await page.evaluate(()=> ({
      chips: document.querySelectorAll('button[data-testid="calendar-event-chip"]').length,
      hasLiveProbe: (document.body.innerText||'').includes('QA-E liveprobe')})));
    await page.waitForTimeout(5000);
  }
  return {url: page.url().replace(/^https?:\/\/[^/]+/,''), samples: out};
};
