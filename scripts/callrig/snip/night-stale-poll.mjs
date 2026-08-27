export default async ({page}) => {
  const M=process.env.QA_MEET; const ms=Number(process.env.QA_MS||300000);
  const out=[]; const t0=Date.now(); let last=null;
  while(Date.now()-t0<ms){
    const s=await page.evaluate(async (M)=>{
      const p=await (await fetch('/api/v1/meeting/'+M+'/participants',{credentials:'include'})).json().catch(()=>({}));
      const panel=document.querySelector('[data-testid="participants-list-panel"]');
      return {names:(p.participants||[]).map(x=>x.name).sort().join(','),
        tiles:[...document.querySelectorAll('[data-testid="participant-tile"]')].length,
        panelCount:(panel? (panel.innerText.match(/(\d+)\s+in call/)||[])[1] : null)};
    }, M);
    const cur=JSON.stringify(s);
    if(cur!==last){ out.push({at:Math.round((Date.now()-t0)/1000)+'s', ...s}); last=cur; }
    await page.waitForTimeout(10000);
  }
  return {timeline: out};
};
