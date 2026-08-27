export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const FILE=process.env.QA_FILE;
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(12000);
  const out={file:FILE.split('/').pop()};
  const input=page.locator('input[type="file"]').first();
  out.inputCount=await input.count();
  if(!out.inputCount) return out;
  await input.setInputFiles(FILE);
  await page.waitForTimeout(6000);
  out.afterAttach=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const chips=[...document.querySelectorAll('*')].filter(v).filter(e=>e.children.length===0)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim())
      .filter(t=>/\.md|preview|attach/i.test(t)&&t.length<50);
    return {chipTexts:[...new Set(chips)].slice(0,5),
      sendEnabled:!!document.querySelector('button[aria-label="Send"]')};});
  await page.locator('button[aria-label="Send"]').first().click({timeout:6000}).catch(()=>{out.sendFail=true});
  await page.waitForTimeout(12000);
  out.rendered=await page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const hit=els.reverse().find(e=>/qa-c2-preview/i.test(e.innerText||''));
    if(!hit) return 'not found';
    const v=(x)=>{const r=x.getBoundingClientRect();return r.width>3&&r.height>3;};
    return {text:(hit.innerText||'').replace(/\s+/g,' ').trim().slice(0,150),
      buttons:[...new Set([...hit.querySelectorAll('button')].filter(v)
        .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim().slice(0,28)))].slice(0,8),
      hasPre:!!hit.querySelector('pre'), hasHeading:!!hit.querySelector('h1,h2,h3')};});
  return out;
};
