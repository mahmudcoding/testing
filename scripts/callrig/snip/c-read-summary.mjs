export default async ({page}) => {
  return await page.evaluate(async ()=>{
    const id = location.pathname.split('/call/')[1];
    let rec=null; try{const r=await (await fetch(`/api/v1/meeting/${id}/recordings`,{credentials:'include'})).json(); const x=(r.recordings||[])[0]; rec=x?{s:x.status,sz:x.file_size,d:x.duration_sec??x.duration_seconds}:null;}catch(e){}
    const body=(document.body.innerText||'').replace(/\n+/g,' | ');
    const i=body.search(/Call ended|Duration|Recording|Transcript|RATE QUALITY/i);
    return {url:location.pathname, rec,
      full: i<0? body.slice(0,400) : body.slice(Math.max(0,i-200), i+500),
      stars: [...document.querySelectorAll('button')].filter(b=>b.getClientRects().length && /star|rating|rate/i.test(b.getAttribute('aria-label')||'')).map(b=>b.getAttribute('aria-label')),
      buttons: [...document.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim()).slice(-14)};
  });
};
