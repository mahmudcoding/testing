export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const pid=await page.evaluate(async (ch)=>{
    const r=await fetch('/api/v1/messaging/messages',{method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({channel_id:ch,body:'QA-GESTURE parent'})});
    const j=await r.json(); return j.id||j.message?.id;}, ch);
  await page.waitForTimeout(2500);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${pid}`);
  await page.waitForTimeout(13000);
  const out={};
  out.hints=await page.evaluate(()=>{
    const vis=(e)=>{let op=1,n=e;
      while(n&&n!==document.documentElement){const s=getComputedStyle(n);
        op*=parseFloat(s.opacity||'1');
        if(s.display==='none'||s.visibility==='hidden') return 0; n=n.parentElement;}
      return +op.toFixed(2);};
    return [...document.querySelectorAll('*')].filter(e=>e.children.length===0)
      .filter(e=>/Enter to send/i.test(e.textContent||''))
      .map(e=>{const r=e.getBoundingClientRect();
        return {x:Math.round(r.left), y:Math.round(r.top), opacity:vis(e),
          ariaHidden:e.closest('[aria-hidden="true"]')?true:false,
          cls:String(e.className||'').slice(0,26)};});});
  // type in the thread composer and press Bold, then Enter
  const boxes=await page.evaluate(()=>[...document.querySelectorAll('div[contenteditable="true"]')]
    .filter(e=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;})
    .map((e,i)=>({i, x:Math.round(e.getBoundingClientRect().left)})));
  const idx=boxes.length?boxes.reduce((a,b)=>b.x>a.x?b:a).i:0;
  const comp=page.locator('div[contenteditable="true"]').nth(idx);
  await comp.click();
  await page.keyboard.type('QA-GESTURE reply');
  await page.waitForTimeout(700);
  const posts=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()==='POST'&&/messages/.test(u))
    posts.push(u.split('/api/v1')[1].slice(0,40));};
  page.on('request',onReq);
  await page.locator('button[aria-label="Bold"]').last().click({timeout:6000}).catch(()=>{out.boldFail=true});
  await page.waitForTimeout(1200);
  await comp.click(); await page.keyboard.press('End'); await page.keyboard.type('X');
  await page.waitForTimeout(600);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);
  page.off('request',onReq);
  out.afterEnter={requests:posts.slice(0,2),
    composerNow:await comp.evaluate(e=>e.innerText.trim().slice(0,30)),
    lines:await comp.evaluate(e=>e.querySelectorAll('p,div').length)};
  return out;
};
