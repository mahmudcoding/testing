export default async ({page}) => {
  // click Test audio then poll the Speakers row
  const btns=await page.$$('main button');
  for (const b of btns){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if(/^Test audio$/i.test(l)){ await b.click(); break; } }
  return await page.evaluate(async ()=>{
    const out=[]; const t0=Date.now(); let last=null;
    while(Date.now()-t0<20000){
      const rows=[...document.querySelectorAll('[data-testid="lobby-check-row"]')];
      const sp=rows.find(r=>/speaker/i.test(r.innerText))||rows[1];
      const a=document.querySelector('audio');
      const cur=(sp?sp.innerText.replace(/\n+/g,' | '):'?')+'  ||  audio paused='+(a?a.paused:'n/a')+' t='+(a?a.currentTime.toFixed(2):'-');
      if(cur!==last){ out.push({at:Math.round((Date.now()-t0)/100)/10+'s', s:cur}); last=cur; }
      await new Promise(r=>setTimeout(r,300));
    }
    return {timeline: out};
  });
};
