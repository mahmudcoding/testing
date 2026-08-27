export default async ({page}) => {
  const WS='W4QCF1XTURESO01'; const out={};
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.locator('button',{hasText:/^Start now$/}).first().click();
  await page.waitForTimeout(2500);
  const ti=await page.$('[role="dialog"] input');
  if(ti){ await ti.click(); await page.keyboard.type('QA-C-REC',{delay:15}); }
  await page.locator('[role="dialog"] button',{hasText:/^Start call$/}).first().click();
  await page.waitForTimeout(9000);
  out.callId = (await page.evaluate(()=>location.pathname)).split('/call/')[1];
  // start recording
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button[aria-label="Record"]')].find(x=>x.getClientRects().length); if(b)b.click();});
  await page.waitForTimeout(1800);
  out.recStarted = await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length).find(e=>/^Start recording$/i.test((e.textContent||'').trim())); if(!b) return false; b.click(); return true;});
  await page.waitForTimeout(22000);
  out.recMid = await page.evaluate(async (id)=>(await (await fetch(`/api/v1/meeting/${id}/recordings`,{credentials:'include'})).text()).slice(0,220), out.callId);
  // end for everyone
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button[aria-label="End for everyone"]')].find(x=>x.getClientRects().length); if(b)b.click();});
  await page.waitForTimeout(1800);
  out.confirm = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')].filter(e=>e.getClientRects().length);
    const d=ds[ds.length-1]; return d? {t:(d.innerText||'').replace(/\n+/g,' | ').slice(0,200), b:[...d.querySelectorAll('button')].map(x=>(x.textContent||'').trim()).filter(Boolean), tid:[...d.querySelectorAll('[data-testid]')].map(x=>x.getAttribute('data-testid'))}:null;
  });
  await page.evaluate(()=>{
    const b=document.querySelector('[data-testid="call-end-confirm-submit"]') || [...document.querySelectorAll('[role="dialog"] button,[role="alertdialog"] button')].find(x=>/^end/i.test((x.textContent||'').trim()));
    if(b) b.click();
  });
  const t0=Date.now(); const rows=[];
  while (Date.now()-t0 < 70000) {
    const s = await page.evaluate(async (id)=>{
      const m=document.querySelector('main')||document.body;
      const txt=(m.innerText||'').replace(/\n+/g,' | ');
      let rec=null; try{const r=await (await fetch(`/api/v1/meeting/${id}/recordings`,{credentials:'include'})).json(); const x=(r.recordings||[])[0]; rec=x?{s:x.status,sz:x.file_size,d:x.duration_seconds??x.duration}:null;}catch(e){}
      const i=txt.search(/Duration|Recording|Transcript|RATE QUALITY/i);
      return {screen: i<0? txt.slice(0,140): txt.slice(Math.max(0,i-60), i+220), rec, url:location.pathname.slice(-24)};
    }, out.callId);
    rows.push({ms:Date.now()-t0, ...s});
    await page.waitForTimeout(2000);
  }
  const cond=[]; let prev='';
  for(const r of rows){const k=JSON.stringify([r.screen,r.rec,r.url]); if(k!==prev){cond.push(r);prev=k;}}
  out.timeline=cond.slice(0,20);
  return out;
};
