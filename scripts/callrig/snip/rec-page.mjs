export default async ({page}) => {
  const url = process.env.QA_URL;
  await page.goto(url, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  const pre = await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    return {labels:[...m.querySelectorAll('*')].filter(e=>e.children.length===0 && /×/.test(e.textContent)).map(e=>e.textContent.trim().slice(0,30)),
            text: m.innerText.replace(/\n+/g,' | ').slice(0,400)};
  });
  const b = page.locator('button[aria-label="Play recording"]').first();
  if (await b.count()) { await b.click(); await page.waitForTimeout(9000); }
  const media = await page.evaluate(()=>[...document.querySelectorAll('video')].map(v=>({w:v.videoWidth,h:v.videoHeight,dur:v.duration,paused:v.paused})));
  return {pre, media};
};
