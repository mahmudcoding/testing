export default async ({page}) => {
  const ms=Number(process.env.QA_MS||60000);
  return await page.evaluate(async (ms)=>{
    const out=[]; const t0=Date.now(); let last=null;
    while(Date.now()-t0<ms){
      const j=await (await fetch('/api/v1/meeting/V4OTZWUJP1IN7EQ/participants',{credentials:'include'})).json();
      const names=(j.participants||[]).map(p=>p.name).sort().join(',');
      if(names!==last){ out.push({at:Math.round((Date.now()-t0)/1000)+'s', names}); last=names; }
      await new Promise(r=>setTimeout(r,3000));
    }
    return {timeline: out};
  }, ms);
};
