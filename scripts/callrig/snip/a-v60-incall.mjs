const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  await page.waitForTimeout(4000);
  const s1 = await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname, vids:document.querySelectorAll('video').length,
      txt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,200) };},VS);
  if(!/\/call\//.test(s1.url) || s1.vids===0){
    // navigate explicitly to the in-call route
    await page.goto('https://airion-cargo.store'+ (s1.url.includes('/call/')? s1.url : '/w/W4QAF1XTURESO01/call/V4OV0O41LELEV7H'),{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(8000);
  }
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/incall-alice2.png'});
  return await page.evaluate((vs)=>{const vis=eval(vs);
    return { url:location.pathname,
      videos:[...document.querySelectorAll('video')].map(v=>({w:v.videoWidth,h:v.videoHeight,paused:v.paused,hasSrc:!!v.srcObject})),
      controls:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim().replace(/\s+/g,' ').slice(0,28)).filter(Boolean),
      txt:(document.querySelector('main')?.innerText||document.body.innerText||'').replace(/\s+/g,' ').slice(0,260) };},VS);
};
