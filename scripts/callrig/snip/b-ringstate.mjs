export default async ({page}) => {
  const snaps = await page.evaluate(async()=>{
    const out=[]; const seen=new Set();
    const vis = el => el.getBoundingClientRect().width>0;
    const t0=Date.now();
    while (Date.now()-t0 < 40000) {
      const t=document.body.innerText.replace(/\s+/g,' ');
      const rec = JSON.stringify({
        ring: (t.match(/(Ringing|Declined|No answer|Call ended|Unavailable|Busy)[^A-Za-z]{0,3}/i)||[])[0]||null,
        btns: [...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(x=>/leave call|call again|cancel|close|end/i.test(x)).join('|')
      });
      if(!seen.has(rec)){ seen.add(rec); out.push({at:Math.round((Date.now()-t0)/1000), ...JSON.parse(rec)}); }
      await new Promise(r=>setTimeout(r,500));
    }
    return out.slice(0,12);
  });
  const cur = await page.evaluate(async()=>{ const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null); return j&&j.meeting?{id:j.meeting.id,status:j.meeting.status}:null; });
  return {snaps, cur};
};
