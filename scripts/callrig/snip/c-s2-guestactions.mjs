export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(13000);
  const out={};
  // 1. send
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  for(let k=0;k<6;k++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await page.waitForTimeout(250);}
  await comp.click();
  const tag='QA-GUESTACT-'+Math.random().toString(36).slice(2,5);
  await page.keyboard.type(tag);
  await page.waitForTimeout(700);
  const posts=[];
  const onReq=(r)=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()==='POST')
    posts.push(u.split('/api/v1')[1].slice(0,34));};
  page.on('request',onReq);
  await page.locator('button[aria-label="Send"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(6000);
  out.send={requests:posts.slice(0,2),
    landedInFeed:await page.evaluate((t)=>[...document.querySelectorAll('main [data-message-id]')]
      .some(e=>(e.innerText||'').includes(t)), tag)};
  // 2. react to someone else's message
  const other=page.locator('main [data-message-id]').filter({hasText:'QA-S2-UNREAD-10'}).last();
  if(await other.count()){
    await other.scrollIntoViewIfNeeded().catch(()=>{});
    await other.hover(); await page.waitForTimeout(1200);
    posts.length=0;
    await other.locator('button[aria-label="Add reaction"]').first().click({timeout:6000}).catch(()=>{});
    await page.waitForTimeout(2500);
    await page.locator('button[aria-label="🔥"]').first().click({timeout:6000}).catch(()=>{out.reactPickFail=true});
    await page.waitForTimeout(4000);
    out.react={requests:posts.slice(0,2)};
  }
  // 3. reply in a thread
  const mine=page.locator('main [data-message-id]').filter({hasText:tag}).last();
  if(await mine.count()){
    await mine.hover(); await page.waitForTimeout(1200);
    posts.length=0;
    await mine.locator('button[aria-label="Reply"]').first().click({timeout:6000}).catch(()=>{out.replyOpenFail=true});
    await page.waitForTimeout(4000);
    out.threadOpened=await page.evaluate(()=>({url:location.search.slice(0,26),
      composers:[...document.querySelectorAll('div[contenteditable="true"]')]
        .filter(e=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;}).length}));
  }
  page.off('request',onReq);
  return out;
};
