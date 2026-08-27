export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const j=await page.$('main button:has-text("Join")');
  if(!j) return {err:'no Join on hub'};
  await j.click();
  await page.waitForTimeout(6000);
  return await page.evaluate(()=>{
    const m=document.querySelector('main')||document.body;
    return {
      url: location.href,
      text: m.innerText.replace(/\n+/g,' | ').slice(0,600),
      buttons:[...m.querySelectorAll('button')].map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40), t:b.getAttribute('data-testid'), d:b.disabled})).filter(b=>b.l||b.t),
      selects:[...m.querySelectorAll('select')].map(s=>({l:s.getAttribute('aria-label'), opts:[...s.options].map(o=>o.text).slice(0,5)})),
      videos:[...m.querySelectorAll('video')].map(v=>({w:v.videoWidth,h:v.videoHeight,paused:v.paused,hasSrc:!!v.srcObject})),
      testids:[...new Set([...m.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')))].slice(0,30)
    };
  });
};
