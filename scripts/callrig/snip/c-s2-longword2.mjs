export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={runs:[]};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const clear=async()=>{for(let k=0;k<8;k++){
    if((await comp.evaluate(e=>e.innerText))==='') return;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);}};
  for(const [tag,len] of [['QALONGA',4009],['QALONGB',4009],['QALONGC',3990]]){
    await clear(); await comp.click();
    const text=tag+'z'.repeat(len-tag.length);
    const reqs=[];
    const h=r=>{ if(/\/api\/v1\/messaging\/messages$/.test(new URL(r.url()).pathname)&&r.method()==='POST'){
      reqs.push((r.postData()||'').length); } };
    page.on('request',h);
    await page.keyboard.insertText(text);
    await page.waitForTimeout(900);
    const typedLen=await comp.evaluate(e=>e.innerText.length);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(6000);
    page.off('request',h);
    const server=await page.evaluate(async ({ch,tag})=>{
      const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=20`,{credentials:'include'});
      const j=await r.json(); const a=j.messages||j.data||[];
      const hits=a.filter(m=>(m.body||'').includes(tag));
      return {count:hits.length, lens:hits.map(m=>(m.body||'').length), seqs:hits.map(m=>m.channel_seq)};
    }, {ch,tag});
    const notices=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
      return [...document.querySelectorAll('[data-sonner-toast],[role="alert"],[role="status"]')]
        .filter(v).map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,50));});
    out.runs.push({tag, inputLen:len, typedLen, postCount:reqs.length,
                   postBodyLens:reqs, server, notices});
  }
  return out;
};
