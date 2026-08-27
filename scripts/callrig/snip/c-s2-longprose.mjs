export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  for(let k=0;k<8;k++){ if((await comp.evaluate(e=>e.innerText))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(250); }
  await comp.click();
  // realistic prose: repeated sentence, padded to just over the boundary
  const unit='QAPROSE the quick brown fox jumps over the lazy dog and keeps running. ';
  let text=''; while(text.length<4060) text+=unit;
  text=text.slice(0,4060);
  out.inputLen=text.length;
  await page.keyboard.insertText(text);
  await page.waitForTimeout(1200);
  out.typedLen=await comp.evaluate(e=>e.innerText.length);
  const posts=[]; const h=r=>{ if(/\/messaging\/messages$/.test(new URL(r.url()).pathname)&&r.method()==='POST'){
    const b=JSON.parse(r.postData()||'{}').body||''; posts.push({len:b.length, head:b.slice(0,18), tail:b.slice(-18)}); } };
  page.on('request',h);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(6500);
  page.off('request',h);
  out.posts=posts;
  out.notices=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;};
    return [...document.querySelectorAll('[data-sonner-toast],[role="alert"],[role="status"]')]
      .filter(v).map(e=>(e.innerText||'').replace(/\s+/g,' ').slice(0,50));});
  return out;
};
