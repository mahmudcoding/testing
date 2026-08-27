export default async ({page}) => {
  const t0=Date.now(); const rows=[]; const CALL=process.env.QA_CALL;
  while (Date.now()-t0 < 75000) {
    const s = await page.evaluate(async (id)=>{
      const m=document.querySelector('main')||document.body;
      const txt=(m.innerText||'').replace(/\n+/g,' | ');
      let rec=null; try{const r=await (await fetch(`/api/v1/meeting/${id}/recordings`,{credentials:'include'})).json(); const x=(r.recordings||[])[0]; rec=x?{s:x.status,sz:x.file_size,d:x.duration_sec??x.duration_seconds}:null;}catch(e){}
      const i=txt.search(/Call ended|Duration|Recording|Transcript|RATE QUALITY/i);
      return {url:location.pathname.slice(-24), rec, screen: i<0? txt.slice(0,130) : txt.slice(Math.max(0,i-70), i+260),
        stars: [...document.querySelectorAll('button')].filter(b=>b.getClientRects().length && /star|rating|rate/i.test(b.getAttribute('aria-label')||'')).length};
    }, CALL);
    rows.push({ms:Date.now()-t0, ...s});
    await page.waitForTimeout(1500);
  }
  const cond=[]; let prev='';
  for(const r of rows){const k=JSON.stringify([r.screen,r.rec,r.url,r.stars]); if(k!==prev){cond.push(r);prev=k;}}
  return {changes: cond.slice(0,22)};
};
