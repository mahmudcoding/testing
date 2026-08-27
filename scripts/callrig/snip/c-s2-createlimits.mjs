export default async ({page}) => {
  const ws='W4QCF1XTURESO01';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}`);
  await page.waitForTimeout(5500);
  const add=page.locator('button[aria-label="Add channel"]');
  out.addBtn=await add.count();
  if(!out.addBtn) return out;
  await add.first().click(); await page.waitForTimeout(1800);
  out.dialog = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>30);
    if(!d) return null;
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
    return {txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,200),
      fields:[...d.querySelectorAll('input,textarea')].filter(vis).map(i=>({tag:i.tagName,
        ph:i.getAttribute('placeholder'), maxlength:i.getAttribute('maxlength'), type:i.type})),
      btns:[...d.querySelectorAll('button')].filter(vis)
        .map(b=>b.getAttribute('aria-label')||(b.textContent||'').trim().slice(0,20))};
  });
  if(!out.dialog) return out;
  // long name + long topic
  const inp=page.locator('[role="dialog"] input:visible').first();
  await inp.click(); await inp.fill('qa-c2-limit-'+'x'.repeat(300));
  await page.waitForTimeout(400);
  out.nameValueLen=await inp.evaluate(e=>e.value.length);
  const ta=page.locator('[role="dialog"] textarea:visible').first();
  out.taCount=await ta.count();
  if(out.taCount){ await ta.click(); await ta.fill('T'.repeat(300)); await page.waitForTimeout(300);
    out.topicValueLen=await ta.evaluate(e=>e.value.length); }
  out.hint = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"]')].find(x=>x.getBoundingClientRect().height>30);
    return d? (d.innerText||'').replace(/\s+/g,' ').slice(0,240):null;});
  const create=page.locator('[role="dialog"] button').filter({hasText:/^Create/}).first();
  out.createFound=await create.count();
  out.createDisabled=out.createFound? await create.evaluate(e=>e.disabled):null;
  const resps=[];
  const onResp=async(r)=>{ if(r.url().includes('/api/v1/channels')&&r.request().method()==='POST'){
    let b=''; try{ b=(await r.text()).slice(0,140);}catch(e){}
    resps.push({status:r.status(), body:b}); } };
  page.on('response', onResp);
  if(out.createFound && !out.createDisabled){ await create.click(); await page.waitForTimeout(3200); }
  page.off('response', onResp);
  out.resps=resps;
  out.notices=await page.evaluate(()=>[...document.querySelectorAll('[role="status"],[role="alert"]')]
    .filter(e=>{const r=e.getBoundingClientRect();return r.width>4&&r.height>4;})
    .map(e=>e.textContent.trim().slice(0,80)));
  out.dialogStillOpen=await page.evaluate(()=>!!document.querySelector('[role="dialog"]'));
  await page.keyboard.press('Escape');
  return out;
};
