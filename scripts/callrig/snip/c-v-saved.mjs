// Finding 3: does a saved plain-text message render its body twice on /chat/saved ?
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  const TAG = process.env.TAG || 'QA-VER-SAVED-1';
  const V=`(e=>{const r=e.getBoundingClientRect(); if(!(r.width>0&&r.height>0))return false; let n=e,o=1;
    while(n){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; o*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return o>0.05;})`;

  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`, {waitUntil:'load'});
  await page.waitForTimeout(4000);
  const comp = page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  await comp.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Delete');
  await comp.type(TAG); await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);

  const msg = page.locator('[data-message-id]').last();
  const id = await msg.getAttribute('data-message-id');
  await msg.scrollIntoViewIfNeeded(); await msg.hover(); await page.waitForTimeout(900);
  const saveBtn = msg.locator('button[aria-label="Save"]');
  const hadSave = await saveBtn.count();
  if(hadSave) await saveBtn.first().click();
  await page.waitForTimeout(2000);

  // FRESH load of the Saved page
  await page.goto('about:blank'); await page.waitForTimeout(400);
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`, {waitUntil:'load'});
  await page.waitForTimeout(4500);

  const dom = await page.evaluate(({v,tag,id})=>{const vv=eval(v);
    const all=[...document.querySelectorAll('[data-message-id]')];
    const entry=all.find(m=>(m.innerText||'').includes(tag)) || all.find(m=>m.getAttribute('data-message-id')===id);
    if(!entry) return {notFound:true, entries:all.map(m=>({id:m.getAttribute('data-message-id'),t:(m.innerText||'').replace(/\s+/g,' ').slice(0,60)}))};
    const leaves=[...entry.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()&&vv(e))
      .map(e=>({tag:e.tagName, cls:(e.className||'').toString().slice(0,24), t:e.textContent.trim().slice(0,50), y:Math.round(e.getBoundingClientRect().top), x:Math.round(e.getBoundingClientRect().left)}));
    const bodyCopies=leaves.filter(l=>l.t===tag);
    return {entryId:entry.getAttribute('data-message-id'), leaves, occurrencesOfTag:bodyCopies.length, bodyCopies, totalEntries:all.length};
  }, {v:V, tag:TAG, id});
  return {postedId:id, hadSaveButton:hadSave, saved:dom};
};
