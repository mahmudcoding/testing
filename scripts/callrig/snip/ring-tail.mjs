export default async ({page}) => {
  const t0=Date.now();
  const out=[];
  for (let i=0;i<40;i++) {
    const s = await page.evaluate(async ()=>{
      const cur = await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();
      return {ringing: /Ringing|Calling/i.test(document.body.innerText),
              status: cur && cur.meeting ? cur.meeting.status : null,
              banner: (document.body.innerText.match(/Ringing…|No answer|Call ended|Missed|Cancelled/)||[])[0]||null};
    });
    out.push({t: Math.round((Date.now()-t0)/1000), ...s});
    if (!s.ringing) break;
    await page.waitForTimeout(10000);
  }
  const final = await page.evaluate(()=>({
    text: (document.querySelector('[data-testid="call-overlay-expanded"]')||document.body).innerText.replace(/\n+/g,' | ').slice(0,300),
    toasts: [...document.querySelectorAll('[data-sonner-toast],[role="status"],[role="alert"]')].map(x=>x.innerText.replace(/\n+/g,' ').slice(0,110)).filter(Boolean)}));
  return {samples: out.filter((x,i)=>i%3===0||i===out.length-1), totalSamples: out.length, lastSample: out[out.length-1], final};
};
