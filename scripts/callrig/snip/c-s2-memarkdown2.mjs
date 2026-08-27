const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(7000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const md=page.locator('button[aria-label="Markdown formatting"]');
  await md.first().click(); await page.waitForTimeout(1000);
  out.md=await md.first().getAttribute('aria-pressed');
  if(!await empty(page, comp)) return {...out, err:'not empty'};
  await comp.type('/me QA-S2-MEMD2 bows', {delay:40});
  await page.waitForTimeout(1300);
  await page.keyboard.press('Enter'); await page.waitForTimeout(1500);
  out.composerAfterExpand=await comp.evaluate(e=>e.innerText);
  out.composerHtml=await comp.evaluate(e=>e.innerHTML.slice(0,220));
  out.hint=await page.evaluate(()=>{
    const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>6&&r.height>6;};
    return [...document.querySelectorAll('body *')].filter(e=>e.children.length===0).filter(vis)
      .map(e=>(e.textContent||'').trim()).filter(t=>/Enter/.test(t)&&t.length<60);});
  const posts=[];
  const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST') posts.push(JSON.parse(r.postData()||'{}').body); };
  page.on('request', onReq);
  await page.keyboard.press('Meta+Enter'); await page.waitForTimeout(3000);
  page.off('request', onReq);
  out.posts=posts;
  out.rendered = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(e=>/QA-S2-MEMD2/.test(e.innerText||''));
    return el? {t:(el.innerText||'').replace(/\s+/g,' ').slice(0,70),
      em:el.querySelectorAll('em,i').length, strong:el.querySelectorAll('strong,b').length,
      html:(()=>{const b=[...el.querySelectorAll('*')].filter(x=>/QA-S2-MEMD2/.test(x.textContent||'')).pop();
        return b? b.outerHTML.slice(0,150):null;})()}:'not found';
  });
  await md.first().click(); await page.waitForTimeout(800);
  out.mdRestored=await md.first().getAttribute('aria-pressed');
  await empty(page, comp);
  return out;
};
