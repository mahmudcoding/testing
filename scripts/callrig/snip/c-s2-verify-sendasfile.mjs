const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  const empty=async()=>{for(let i=0;i<8;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220);} return false;};
  const run=async(toggle, tag)=>{
    await empty();
    await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-m1.png`);
    await page.waitForTimeout(4000);
    const tog=page.locator('button[aria-label="Send as file"], button[aria-label="Send as photo"]').first();
    const label0=await tog.count()? await tog.getAttribute('aria-label') : null;
    if(toggle && await tog.count()){ await tog.click(); await page.waitForTimeout(1400); }
    const t2=page.locator('button[aria-label="Send as file"], button[aria-label="Send as photo"]').first();
    const label1=await t2.count()? await t2.getAttribute('aria-label') : null;
    const bodies=[];
    const h=(r)=>{ if(/\/messaging\/messages$/.test(r.url()) && r.method()==='POST'){
      try{ bodies.push(r.postData()||''); }catch(e){} } };
    page.on('request',h);
    await comp.click(); await comp.type(tag,{delay:35}); await page.waitForTimeout(400);
    await page.keyboard.press('Enter'); await page.waitForTimeout(9000);
    page.off('request',h);
    const rendered=await page.evaluate((tag)=>{
      const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
        .find(x=>(x.innerText||'').includes(tag));
      return e? {imgs:e.querySelectorAll('img').length,
        btns:[...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label')).filter(Boolean).slice(0,4)}:null;}, tag);
    return {labelBefore:label0, labelAfter:label1,
      postBody: bodies.length? bodies[0].replace(/"idempotency_key":"[^"]*"/,'"idempotency_key":"<k>"').slice(0,150):'(none captured)',
      rendered};
  };
  out.photoMode=await run(false,'QA-V2-SAF-photo');
  out.fileMode =await run(true ,'QA-V2-SAF-file');
  const strip=(b)=>b.replace(/"file_ids":\["[^"]*"\]/,'"file_ids":["<f>"]')
                    .replace(/"body":"[^"]*"/,'"body":"<t>"');
  out.bodiesIdentical = strip(out.photoMode.postBody)===strip(out.fileMode.postBody);
  out.bothRenderImage = !!(out.photoMode.rendered&&out.fileMode.rendered
    && out.photoMode.rendered.imgs>0 && out.fileMode.rendered.imgs>0);
  out.PASS = out.bodiesIdentical && out.bothRenderImage;
  await empty();
  return out;
};
