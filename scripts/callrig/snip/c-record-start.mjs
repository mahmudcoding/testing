export default async ({page}) => {
  const net=[];
  page.on('response', async r=>{ if(/record/i.test(r.url())){ let b=''; try{b=(await r.text()).slice(0,160);}catch(e){} net.push({m:r.request().method(), u:r.url().replace('https://airion-cargo.store',''), s:r.status(), b}); }});
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  const ok = await page.evaluate(()=>{const b=[...document.querySelectorAll('button[aria-label="Record"]')].find(x=>x.getClientRects().length); if(!b) return false; b.click(); return true;});
  await page.waitForTimeout(2000);
  const dlg = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role="dialog"],[role="menu"]')].filter(e=>e.getClientRects().length);
    return ds.map(d=>({txt:(d.innerText||'').replace(/\n+/g,' | ').slice(0,250), btns:[...d.querySelectorAll('button')].map(b=>(b.textContent||'').trim()).filter(Boolean).slice(0,6)}));
  });
  const started = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length).find(e=>/^Start recording$/i.test((e.textContent||'').trim()));
    if(!b) return false; b.click(); return true;
  });
  await page.waitForTimeout(6000);
  const st = await page.evaluate(async ()=>{
    const cur=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();
    const id=cur.meeting?cur.meeting.id:null;
    let rec=null; if(id){ try{ rec=(await (await fetch(`/api/v1/meeting/${id}`,{credentials:'include'})).text()).slice(0,400);}catch(e){} }
    return {id, meetingJson: rec};
  });
  return {clickedRecord: ok, dlg, started, net, st};
};
