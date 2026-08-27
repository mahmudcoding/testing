export default async ({page}) => ({
  url: await page.evaluate(()=>location.href),
  inCall: await page.evaluate(()=>/\/call\//.test(location.pathname)),
  videos: await page.evaluate(()=>document.querySelectorAll('video').length),
  audios: await page.evaluate(()=>document.querySelectorAll('audio').length),
  tiles: await page.evaluate(()=>document.querySelectorAll('[data-testid="participant-tile"]').length),
  text: await page.evaluate(()=>(document.querySelector('main')?.innerText||document.body.innerText).replace(/\s+/g,' ').slice(0,220))
});
