export default async ({page}) => {
  const netlog=[];
  page.on('response', async r=>{const u=r.url(); if(/record|\.mp4|blob|media/i.test(u)) netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','').slice(0,120)}`);});
  const b = await page.$('button[aria-label="Play recording"]') || (await page.$$('button')).find(async x=>/Play recording/.test(await x.innerText()));
  const btns = await page.$$('button');
  let clicked=false;
  for (const x of btns) { const t=((await x.getAttribute('aria-label'))||(await x.innerText())||'').trim(); if (/^Play recording$/i.test(t)) { await x.click(); clicked=true; break; } }
  if (!clicked) return {err:'no play btn'};
  await page.waitForTimeout(9000);
  const media = await page.evaluate(()=>[...document.querySelectorAll('video,audio')].map(v=>({tag:v.tagName, src:(v.currentSrc||v.src||'').slice(0,120), dur:v.duration, w:v.videoWidth, h:v.videoHeight, paused:v.paused, t:v.currentTime, err:v.error?v.error.code:null})));
  return {clicked, media, net: netlog.slice(-8)};
};
