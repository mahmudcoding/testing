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
  const send=async(text, useMd)=>{
    const cur=await md.first().getAttribute('aria-pressed');
    if((cur==='true')!==useMd){ await md.first().click(); await page.waitForTimeout(900); }
    await empty(page, comp);
    await comp.type(text, {delay:35}); await page.waitForTimeout(400);
    const posts=[];
    const onReq=r=>{ if(r.url().endsWith('/api/v1/messaging/messages')&&r.method()==='POST') posts.push(JSON.parse(r.postData()||'{}').body); };
    page.on('request', onReq);
    if(useMd) await page.keyboard.press('Meta+Enter'); else await page.keyboard.press('Enter');
    await page.waitForTimeout(2800);
    page.off('request', onReq);
    return posts[0];
  };
  out.plainBody = await send('QA-S2-QUOTE-PLAIN a-b-c','' === 'x');   // plain
  out.mdBody    = await send('QA-S2-QUOTE-MD a-b-c', true);
  // now open a thread on each and read the quote preview
  const quoteOf=async(tag)=>{
    const el=page.locator('main [data-message-id]').filter({hasText:tag}).last();
    if(!await el.count()) return 'not rendered';
    const id=await el.getAttribute('data-message-id');
    await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}?thread=${id}`);
    await page.waitForTimeout(6000);
    return page.evaluate((tag)=>{
      const vis=(x)=>{const r=x.getBoundingClientRect();return r.width>4&&r.height>4;};
      const hits=[...document.querySelectorAll('body *')].filter(e=>e.children.length===0).filter(vis)
        .map(e=>(e.textContent||'').trim()).filter(t=>t.includes(tag.slice(0,12)));
      return [...new Set(hits)].slice(0,4);
    }, tag);
  };
  out.plainQuote = await quoteOf('QA-S2-QUOTE-PLAIN');
  out.mdQuote    = await quoteOf('QA-S2-QUOTE-MD');
  const cur=await md.first().getAttribute('aria-pressed');
  if(cur==='true'){ await md.first().click(); await page.waitForTimeout(900); }
  out.mdFinal=await md.first().getAttribute('aria-pressed');
  return out;
};
