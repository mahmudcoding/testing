export default async ({page}) => {
  const out={};
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  const mid = await page.evaluate(async ()=>{const c=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json(); return c.meeting?c.meeting.id:null;});
  out.mid = mid;
  out.recBefore = await page.evaluate(async (id)=>(await (await fetch(`/api/v1/meeting/${id}/recordings`,{credentials:'include'})).text()).slice(0,300), mid);
  // End for everyone
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button[aria-label="End for everyone"]')].find(x=>x.getClientRects().length); if(b)b.click();});
  await page.waitForTimeout(1800);
  out.confirmDlg = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(e=>e.getClientRects().length);
    return ds.map(d=>({t:(d.innerText||'').replace(/\n+/g,' | ').slice(0,200), b:[...d.querySelectorAll('button')].map(x=>(x.textContent||'').trim()).filter(Boolean)}));
  });
  await page.evaluate(()=>{
    const b=[...document.querySelectorAll('[data-testid="call-end-confirm-submit"]')].find(x=>x.getClientRects().length)
      || [...document.querySelectorAll('button')].filter(x=>x.getClientRects().length).find(x=>/^end (call|for everyone)$/i.test((x.textContent||'').trim()));
    if(b) b.click();
  });
  const t0=Date.now(); const rows=[];
  while (Date.now()-t0 < 75000) {
    const s = await page.evaluate(async (id)=>{
      const m=document.querySelector('main')||document.body;
      const txt=(m.innerText||'').replace(/\n+/g,' | ');
      const i=txt.search(/Duration|Recording|Transcript/i);
      let rec=null; try{ const r=await (await fetch(`/api/v1/meeting/${id}/recordings`,{credentials:'include'})).json();
        const x=(r.recordings||[])[0]; rec = x? {status:x.status, size:x.file_size, dur:x.duration_seconds ?? x.duration} : null; }catch(e){}
      return {screen: i<0? txt.slice(0,160) : txt.slice(Math.max(0,i-40), i+180), rec};
    }, mid);
    rows.push({ms: Date.now()-t0, ...s});
    await page.waitForTimeout(2000);
  }
  const cond=[]; let prev='';
  for(const r of rows){const k=JSON.stringify([r.screen,r.rec]); if(k!==prev){cond.push(r);prev=k;}}
  out.timeline = cond.slice(0,20);
  out.last = rows[rows.length-1];
  return out;
};
