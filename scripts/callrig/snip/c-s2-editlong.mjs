export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  const tag='QAEDITLONG';
  await page.evaluate(async ({ch,tag})=>{ await fetch('/api/v1/messaging/messages',{method:'POST',
    credentials:'include',headers:{'content-type':'application/json'},
    body:JSON.stringify({channel_id:ch, body:tag+' base'})}); }, {ch,tag});
  await page.waitForTimeout(2500);
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const msg=page.locator('[data-message-id]').filter({hasText:tag}).last();
  out.msgFound=await msg.count();
  if(!out.msgFound) return out;
  await msg.hover(); await page.waitForTimeout(1300);
  await msg.locator('button[aria-label="More actions"]').first().click({timeout:6000});
  await page.waitForTimeout(1500);
  const ed=page.locator('[role="menuitem"]').filter({hasText:/^Edit/}).first();
  out.editItem=await ed.count();
  if(!out.editItem) return out;
  await ed.click(); await page.waitForTimeout(2000);
  // the edit box is a contenteditable inside the message
  out.editables=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('div[contenteditable="true"],textarea')].filter(v)
      .map((e,i)=>({i, tag:e.tagName, label:e.getAttribute('aria-label')||'',
        inMsg: !!e.closest('[data-message-id]'),
        txt:(e.innerText||e.value||'').slice(0,24)}));});
  const idx=(out.editables.find(e=>e.inMsg)||out.editables.find(e=>/QAEDITLONG/.test(e.txt))||{}).i;
  if(idx===undefined){ return out; }
  const box=page.locator('div[contenteditable="true"],textarea').nth(idx);
  out.boxFound=1; out.usingIdx=idx;
  await box.click();
  await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
  await page.waitForTimeout(300);
  const unit=tag+' the quick brown fox jumps over the lazy dog and keeps going. ';
  let text=''; while(text.length<4060) text+=unit;
  text=text.slice(0,4060);
  out.inputLen=text.length;
  await page.keyboard.insertText(text);
  await page.waitForTimeout(1200);
  out.typedLen=await box.evaluate(e=>e.innerText.length);
  const reqs=[]; const h=r=>{ const p=new URL(r.url()).pathname;
    if(/\/messaging\//.test(p)&&['PATCH','PUT','POST'].includes(r.method())){
      const b=r.postData()||''; reqs.push(r.method()+' '+p.slice(-34)+' bodyLen='+b.length); } };
  page.on('request',h);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(6000);
  page.off('request',h);
  out.reqs=reqs;
  out.notices=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
    return [...document.querySelectorAll('[data-sonner-toast],[role="alert"],[role="status"]')]
      .filter(v).map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,60));});
  out.server=await page.evaluate(async ({ch,tag})=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=10`,{credentials:'include'});
    const j=await r.json(); const a=j.messages||j.data||[];
    const hits=a.filter(m=>(m.body||'').includes(tag));
    return hits.map(m=>({seq:m.channel_seq, len:(m.body||'').length, tail:(m.body||'').slice(-16)}));
  }, {ch,tag});
  return out;
};
