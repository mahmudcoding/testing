export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calls',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const ms=Number(process.env.QA_MS||70000);
  return await page.evaluate(async (ms)=>{
    const out=[]; const t0=Date.now(); let last=null;
    const snap=()=>{
      const m=document.querySelector('main');
      const t=(m?m.innerText:'').replace(/\n+/g,' | ');
      const live=t.match(/Live now \| (\d+)[\s\S]{0,140}/);
      return live?live[0].slice(0,150):'(no Live now block)';
    };
    last=snap(); out.push({at:'0s', live:last});
    while(Date.now()-t0<ms){ await new Promise(r=>setTimeout(r,1500)); const c=snap(); if(c!==last){ out.push({at:Math.round((Date.now()-t0)/1000)+'s', live:c}); last=c; } }
    return {timeline: out};
  }, ms);
};
