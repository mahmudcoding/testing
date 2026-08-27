export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={};
  await page.locator('input[type="file"]').first().setInputFiles(process.env.QA_FILE);
  await page.waitForTimeout(6000);
  out.toggles=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    return [...document.querySelectorAll('button,[role="switch"],[role="checkbox"],label')].filter(v)
      .map(e=>`${e.tagName.toLowerCase()}:${(e.getAttribute('aria-label')||e.innerText||'').replace(/\s+/g,' ').trim().slice(0,26)}|checked=${e.getAttribute('aria-checked')||e.getAttribute('aria-pressed')||''}`)
      .filter(t=>/as file|as photo|Send as/i.test(t));});
  const saf=page.locator('button[aria-label="Send as file"]').first();
  out.sendAsFileCount=await saf.count();
  if(out.sendAsFileCount){
    out.beforeState=await saf.evaluate(b=>({pressed:b.getAttribute('aria-pressed'),
      checked:b.getAttribute('aria-checked'), dataState:b.getAttribute('data-state')}));
    await saf.click({timeout:6000}).catch(()=>{out.toggleFail=true});
    await page.waitForTimeout(2000);
    out.afterState=await page.evaluate(()=>{
      const b=document.querySelector('button[aria-label="Send as file"]')
           || document.querySelector('button[aria-label="Send as photo"]');
      return b?{label:b.getAttribute('aria-label'), pressed:b.getAttribute('aria-pressed'),
        checked:b.getAttribute('aria-checked'), dataState:b.getAttribute('data-state')}:'gone';});
  }
  const bodies=[];
  const onReq=(r)=>{const u=r.url();
    if(u.includes('/api/v1/')&&r.method()==='POST'&&/messages|upload/.test(u)){
      try{ bodies.push(u.split('/api/v1')[1].slice(0,34)+' :: '+String(r.postData()||'').slice(0,140)); }catch(e){} }};
  page.on('request',onReq);
  await page.locator('button[aria-label="Send"]').first().click({timeout:6000}).catch(()=>{out.sendFail=true});
  await page.waitForTimeout(12000);
  page.off('request',onReq);
  out.requests=bodies.slice(0,3);
  out.rendered=await page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const hit=els.reverse().find(e=>/qa-c2-saf/.test(e.innerText||'')||e.querySelector('img'));
    return hit?{imgs:hit.querySelectorAll('img').length,
      text:(hit.innerText||'').replace(/\s+/g,' ').trim().slice(-50)}:'not found';});
  return out;
};
