const empty = async (page, comp) => {
  for (let i=0;i<8;i++){
    if ((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);
  }
  return false;
};
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  const out={runs:[]};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(8000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const md=page.locator('button[aria-label="Markdown formatting"]').first();
  const btns=['Bold','Italic','Strikethrough','Insert list','Insert numbered list','Insert code','Insert quote','Insert code block'];
  for (let i=0;i<btns.length;i++){
    const name=btns[i];
    if(!await empty(page, comp)) { out.runs.push({name, err:'not empty'}); continue; }
    const b=page.locator(`button[aria-label="${name}"]`).first();
    if(!await b.count()){ out.runs.push({name, err:'button absent'}); continue; }
    await comp.click();
    await b.click(); await page.waitForTimeout(700);
    const tag='QA-S2-TB'+i;
    await comp.type(tag, {delay:30}); await page.waitForTimeout(400);
    const composer=await comp.evaluate(e=>e.innerText.slice(0,40));
    const posts=[];
    const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST') posts.push(JSON.parse(r.postData()||'{}').body); };
    page.on('request', onReq);
    await page.keyboard.press('Meta+Enter'); await page.waitForTimeout(2200);
    if(!posts.length){ await page.keyboard.press('Enter'); await page.waitForTimeout(2000); }
    page.off('request', onReq);
    const rendered=await page.evaluate((tag)=>{
      const e=[...document.querySelectorAll('main [data-message-id]')].reverse()
        .find(x=>new RegExp(tag).test(x.innerText||''));
      if(!e) return 'not sent';
      return {txt:(e.innerText||'').replace(/\s+/g,' ').slice(-30),
        nodes:{strong:e.querySelectorAll('strong,b').length, em:e.querySelectorAll('em,i').length,
          del:e.querySelectorAll('del,s').length, li:e.querySelectorAll('li').length,
          ol:e.querySelectorAll('ol').length, ul:e.querySelectorAll('ul').length,
          code:e.querySelectorAll('code').length, pre:e.querySelectorAll('pre').length,
          quote:e.querySelectorAll('blockquote').length}};}, tag);
    out.runs.push({name, composer, sent:posts[0]||null, rendered});
    // turn markdown back off if it got enabled
    const st=await md.getAttribute('aria-pressed');
    if(st==='true'){ await md.click(); await page.waitForTimeout(700); }
  }
  await empty(page, comp);
  return out;
};
