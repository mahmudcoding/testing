const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/directories?tab=people`);
  await page.waitForTimeout(6000);
  const ok=await page.evaluate((name)=>{
    let best=null;
    for (const el of document.querySelectorAll('main *')){
      const t=el.innerText||''; if(!t.includes(name)) continue;
      const b=[...el.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||x.textContent.trim())==='Message');
      if(!b) continue;
      const a=el.getBoundingClientRect().width*el.getBoundingClientRect().height;
      if(!best||a<best.a) best={el,a};
    }
    if(!best) return {err:'no row'};
    const names=[...new Set((best.el.innerText||'').match(/QA [A-Z][a-z]+/g)||[])];
    if(names.length!==1) return {err:'row spans '+names.join(',')};
    [...best.el.querySelectorAll('button')].find(x=>(x.getAttribute('aria-label')||x.textContent.trim())==='Message')
      .setAttribute('data-qa-msgbtn','1');
    return {ok:true, names};
  }, process.env.QA_TARGET||'QA Alice');
  out.row=ok;
  if(!ok.ok) return out;
  await page.locator('[data-qa-msgbtn="1"]').click();
  await page.waitForTimeout(5000);
  out.url=page.url();
  out.screen=await page.evaluate(()=>{
    const m=document.querySelector('main');
    return (m?m.innerText:'').replace(/\s+/g,' ').slice(0,220);});
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  out.composer=await comp.count();
  if(!out.composer) return out;
  await empty(page, comp);
  await comp.type('QA-S2-REQ2 first contact', {delay:35}); await page.waitForTimeout(400);
  const posts=[];
  const onReq=r=>{ if(r.url().includes('/api/v1/messaging/')&&r.method()==='POST') posts.push({u:r.url().split('/api/v1')[1].slice(0,40), body:(r.postData()||'').slice(0,80)}); };
  page.on('request', onReq);
  await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
  page.off('request', onReq);
  out.posts=posts;
  out.after=await page.evaluate(()=>{
    const m=document.querySelector('main');
    return {txt:(m?m.innerText:'').replace(/\s+/g,' ').slice(0,200),
      msgs:document.querySelectorAll('main [data-message-id]').length};});
  return out;
};
