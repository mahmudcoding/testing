export default async ({page}) => {
  const ms=Number(process.env.QA_MS||60000);
  return await page.evaluate(async (ms)=>{
    const out=[]; const t0=Date.now(); let last=null;
    while(Date.now()-t0<ms){
      const t=document.querySelector('[data-testid="call-top-bar"]');
      const cur=t?t.innerText.replace(/\n+/g,' | ').replace(/\d+:\d+/,'MM:SS').slice(0,90):'(no top bar)';
      if(cur!==last){ out.push({at:Math.round((Date.now()-t0)/1000)+'s', top:cur}); last=cur; }
      await new Promise(r=>setTimeout(r,2000));
    }
    return {timeline: out};
  }, ms);
};
