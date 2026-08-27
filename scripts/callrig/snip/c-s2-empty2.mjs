export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const clear=async()=>{for(let k=0;k<8;k++){
    if((await comp.evaluate(e=>e.innerText))==='') return;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);}};
  await clear(); await comp.click();
  // leading newlines, then a body that crosses the 4000 boundary
  for(let i=0;i<3;i++) await page.keyboard.press('Shift+Enter');
  await page.keyboard.insertText('QAEMPTY'+'w'.repeat(4002));
  await page.waitForTimeout(900);
  out.typedLen=await comp.evaluate(e=>e.innerText.length);
  const posts=[]; const h=r=>{ if(/\/messaging\/messages$/.test(new URL(r.url()).pathname)&&r.method()==='POST')
    posts.push(JSON.parse(r.postData()||'{}').body?.length ?? -1); };
  page.on('request',h);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(6500);
  page.off('request',h);
  out.postBodyLens=posts;
  out.tail=await page.evaluate(async (ch)=>{
    const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=6`,{credentials:'include'});
    const j=await r.json(); const a=j.messages||j.data||[];
    return a.map(m=>`${m.channel_seq} len=${(m.body||'').length} ${JSON.stringify((m.body||'').slice(0,10))}`);
  }, ch);
  out.emptyBubbles=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('main [data-message-id]')].filter(v)
      .filter(e=>(e.innerText||'').replace(/\s/g,'').length<24)
      .map(e=>({h:Math.round(e.getBoundingClientRect().height),
                txt:(e.innerText||'').replace(/\s+/g,' ').slice(0,30)})).slice(-4);});
  return out;
};
