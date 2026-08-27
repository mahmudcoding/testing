export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  const doEdit=async(label, len)=>{
    const tag='QAEC'+len;
    await page.evaluate(async ({ch,tag})=>{ await fetch('/api/v1/messaging/messages',{method:'POST',
      credentials:'include',headers:{'content-type':'application/json'},
      body:JSON.stringify({channel_id:ch, body:tag+' base'})}); }, {ch,tag});
    await page.waitForTimeout(2500);
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
    await page.waitForTimeout(8500);
    const msg=page.locator('[data-message-id]').filter({hasText:tag}).last();
    await msg.hover(); await page.waitForTimeout(1300);
    await msg.locator('button[aria-label="More actions"]').first().click({timeout:6000});
    await page.waitForTimeout(1400);
    await page.locator('[role="menuitem"]').filter({hasText:/^Edit/}).first().click();
    await page.waitForTimeout(1800);
    const box=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
    await box.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(300);
    const unit=tag+' alpha beta gamma delta epsilon zeta eta theta iota kappa. ';
    let text=''; while(text.length<len) text+=unit;
    text=text.slice(0,len);
    await page.keyboard.insertText(text);
    await page.waitForTimeout(1000);
    const typed=await box.evaluate(e=>e.innerText.length);
    // prove the Enter keypress reaches the box
    await box.evaluate(e=>{ window.__k=0; e.addEventListener('keydown',ev=>{ if(ev.key==='Enter') window.__k++; },{capture:true}); });
    const reqs=[]; const h=r=>{ const p=new URL(r.url()).pathname;
      if(/\/messaging\//.test(p)&&r.method()!=='GET') reqs.push(r.method()+' '+p.slice(-30)); };
    page.on('request',h);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5500);
    page.off('request',h);
    const enterSeen=await page.evaluate(()=>window.__k||0);
    const server=await page.evaluate(async ({ch,tag})=>{
      const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=8`,{credentials:'include'});
      const j=await r.json(); const a=j.messages||j.data||[];
      return a.filter(m=>(m.body||'').includes(tag)).map(m=>({len:(m.body||'').length}));
    }, {ch,tag});
    const notices=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
      return [...document.querySelectorAll('[data-sonner-toast],[role="alert"],[role="status"]')]
        .filter(v).map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,54));});
    out[label]={typed, enterSeen, reqs, server, notices};
  };
  await doEdit('shortEdit', 60);
  await doEdit('longEdit', 4060);
  return out;
};
