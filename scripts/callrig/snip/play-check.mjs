export default async ({page}) => {
  const net=[];
  page.on('response', r=>{const u=r.url(); if(/\.mp4|record|blob|minio|media/i.test(u)) net.push(`${r.status()} ${u.replace('https://airion-cargo.store','').slice(0,140)}`);});
  const b = page.locator('button[aria-label="Play recording"]').first();
  if (!(await b.count())) return {err:'no play'};
  await b.click();
  await page.waitForTimeout(10000);
  const media = await page.evaluate(()=>[...document.querySelectorAll('video,audio')].map(v=>({tag:v.tagName, src:(v.currentSrc||v.src||'').slice(0,150), dur:v.duration, paused:v.paused, t:v.currentTime, ready:v.readyState, w:v.videoWidth, h:v.videoHeight, err:v.error?{code:v.error.code,msg:(v.error.message||'').slice(0,80)}:null})));
  await page.waitForTimeout(5000);
  const media2 = await page.evaluate(()=>[...document.querySelectorAll('video,audio')].map(v=>({paused:v.paused, t:v.currentTime, buffered: v.buffered.length? v.buffered.end(0):0})));
  const ui = await page.evaluate(()=>({text:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,400)}));
  return {media, media2, ui, net: [...new Set(net)].slice(-8)};
};
