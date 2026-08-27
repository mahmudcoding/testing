export default async ({page}) => {
  const M=process.env.QA_MEET; const ms=Number(process.env.QA_MS||70000);
  // end the call from this page, then poll the ended surface
  await page.evaluate(async (M)=>{ await fetch('/api/v1/meeting/'+M+'/end',{method:'POST',credentials:'include'}); }, M);
  return await page.evaluate(async ({M,ms})=>{
    const out=[]; const t0=Date.now(); let last=null;
    while(Date.now()-t0<ms){
      const st=document.querySelector('[data-testid="call-ended-stats"]');
      const rec=await (await fetch('/api/v1/meeting/'+M+'/recordings',{credentials:'include'})).json();
      const r=(rec.recordings||[])[0]||{};
      const cur=(st?st.innerText.replace(/\n+/g,' | '):'(no stats)')+'  ||  server: '+r.status+' '+r.file_size+'B '+r.duration_sec+'s';
      if(cur!==last){ out.push({at:Math.round((Date.now()-t0)/1000)+'s', state:cur}); last=cur; }
      await new Promise(x=>setTimeout(x,2000));
    }
    return {timeline: out};
  }, {M,ms});
};
