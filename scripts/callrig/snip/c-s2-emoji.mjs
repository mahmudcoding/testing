export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCPRIVATE0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(11000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  const empty=async()=>{ for(let i=0;i<8;i++){
      if((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
      await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
      await page.waitForTimeout(250);} return false;};
  const out={cleared:await empty()};
  out.composerControls=await page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    if(!c) return 'no composer';
    let host=c; for(let i=0;i<4&&host.parentElement;i++) host=host.parentElement;
    return [...new Set([...host.querySelectorAll('button')].filter(v)
      .map(b=>(b.getAttribute('aria-label')||b.innerText||'(unnamed)').replace(/\s+/g,' ').trim().slice(0,26)))];});
  const emojiLabel=(out.composerControls||[]).find(t=>/emoji|smiley|reaction/i.test(t));
  out.emojiButton=emojiLabel||null;
  if(emojiLabel){
    await page.locator(`button[aria-label="${emojiLabel}"]`).first().click({timeout:6000}).catch(()=>{out.openFail=true});
    await page.waitForTimeout(3500);
    out.picker=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      const d=[...document.querySelectorAll('[role="dialog"],[role="menu"],[data-radix-popper-content-wrapper]')].filter(v)[0];
      if(!d) return 'NO-PICKER';
      const b=d.getBoundingClientRect();
      return {size:`${Math.round(b.width)}x${Math.round(b.height)}`,
        buttons:d.querySelectorAll('button').length,
        text:(d.innerText||'').replace(/\s+/g,' ').trim().slice(0,80),
        inputs:[...d.querySelectorAll('input')].filter(v).map(i=>i.getAttribute('placeholder')||'(none)')};});
  }
  return out;
};
