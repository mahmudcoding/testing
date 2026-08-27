export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  const menuOf=async(sel)=>{
    const el=page.locator(sel).first();
    if(!await el.count()) return {err:'not found'};
    await el.scrollIntoViewIfNeeded(); await el.hover(); await page.waitForTimeout(1000);
    const hoverBtns=await el.evaluate(e=>{
      const v=(x)=>{const r=x.getBoundingClientRect();return r.width>3&&r.height>3;};
      return [...e.querySelectorAll('button,[role="button"]')].filter(v)
        .map(b=>b.getAttribute('aria-label')).filter(Boolean);});
    const more=el.locator('button[aria-label="More actions"]').first();
    if(!await more.count()) return {hoverBtns, menu:'(no More actions)'};
    await more.click(); await page.waitForTimeout(1500);
    const menu=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const m=[...document.querySelectorAll('[role="menu"],[data-radix-popper-content-wrapper]')].filter(v)[0];
      return m? (m.innerText||'').split('\n').map(s=>s.trim()).filter(Boolean):[];});
    await page.keyboard.press('Escape'); await page.waitForTimeout(600);
    return {hoverBtns, menu};
  };
  // 1. save someone else's message from a channel, and note the channel menu
  await page.goto(`https://airion-cargo.store/w/${ws}/c/C4QCGENERAL0001`);
  await page.waitForTimeout(9000);
  const other=await page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [data-message-id]')].reverse();
    const e=els.find(x=>/QA-S2-IDLE/.test(x.innerText||''));
    return e? e.getAttribute('data-message-id'):null;});
  out.otherMsg=other;
  if(other){
    out.channelMenuForOthers=await menuOf(`main [data-message-id="${other}"]`);
    const el=page.locator(`main [data-message-id="${other}"]`);
    await el.hover(); await page.waitForTimeout(800);
    const save=el.locator('button[aria-label="Save"]').first();
    out.saveClicked=await save.count();
    if(out.saveClicked){ await save.click(); await page.waitForTimeout(3000); }
  }
  // 2. the Saved page: menus for a saved copy and for a self-note
  await page.goto(`https://airion-cargo.store/w/${ws}/chat/saved`);
  await page.waitForTimeout(10000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  if(await comp.count()){
    for(let i=0;i<6;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') break;
      await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220); }
    await comp.type('QA-V2-NOTE self',{delay:35}); await page.waitForTimeout(400);
    await page.keyboard.press('Enter'); await page.waitForTimeout(5000);
  }
  const ids=await page.evaluate(()=>{
    const els=[...document.querySelectorAll('main [data-message-id]')];
    const note=els.reverse().find(e=>/QA-V2-NOTE/.test(e.innerText||''));
    const copy=els.find(e=>/QA-S2-IDLE/.test(e.innerText||''));
    return {note:note?note.getAttribute('data-message-id'):null,
      copy:copy?copy.getAttribute('data-message-id'):null};});
  out.ids=ids;
  if(ids.note) out.savedNoteMenu=await menuOf(`main [data-message-id="${ids.note}"]`);
  if(ids.copy) out.savedCopyMenu=await menuOf(`main [data-message-id="${ids.copy}"]`);
  return out;
};
