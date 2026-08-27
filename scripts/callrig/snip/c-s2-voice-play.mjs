export default async ({page}) => {
  const out={};
  const el = page.locator('[data-message-id]').last();
  const btn = el.locator('button[aria-label^="Play voice"]').first();
  out.before = await page.evaluate(()=>({audios:[...document.querySelectorAll('audio')].length}));
  await btn.click({timeout:8000});
  await page.waitForTimeout(1500);
  out.t1 = await page.evaluate(()=>{
    const a=[...document.querySelectorAll('audio')];
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {audios:a.map(x=>({src:(x.currentSrc||x.src||'').slice(0,60), paused:x.paused, ct:x.currentTime, dur:x.duration})),
            btns:[...el.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||'').slice(0,32)),
            text: el.innerText.replace(/\n+/g,' | ').slice(0,80)};
  });
  await page.waitForTimeout(3000);
  out.t2 = await page.evaluate(()=>{
    const a=[...document.querySelectorAll('audio')];
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {audios:a.map(x=>({paused:x.paused, ct:Math.round(x.currentTime*100)/100, dur:x.duration})),
            text: el.innerText.replace(/\n+/g,' | ').slice(0,80)};
  });
  return out;
};
