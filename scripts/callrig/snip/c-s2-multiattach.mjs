const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4OX0TTLIMVOUBH';
  const out={};
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]').first();
  const empty=async()=>{for(let i=0;i<8;i++){ if((await comp.evaluate(e=>e.innerText.trim()))==='') return true;
    await comp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await page.waitForTimeout(220);} return false;};
  const send=async(files, tag)=>{
    await empty();
    await page.locator('input[type=file]').first().setInputFiles(files.map(f=>`${DIR}/${f}`));
    await page.waitForTimeout(5000);
    const chips=await page.evaluate(()=>{
      const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
      return [...document.querySelectorAll('*')].filter(e=>e.children.length===0&&v(e))
        .map(e=>(e.textContent||'').trim()).filter(t=>/Ready to send/.test(t)).length;});
    await comp.click(); await comp.type(tag,{delay:30}); await page.waitForTimeout(400);
    await page.keyboard.press('Enter'); await page.waitForTimeout(12000);
    return page.evaluate(async({ch,tag,chips})=>{
      const r=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=3`,{credentials:'include'});
      const j=await r.json(); const m=(j.messages||[]).find(x=>(x.body||'').includes(tag.replace(/-/g,'\\-'))||(x.body||'').includes(tag));
      const e=m? document.querySelector(`main [data-message-id="${m.id}"]`):null;
      const inner=window.innerWidth;
      return {chipsBeforeSend:chips, storedFiles:m? (m.files||m.attachments||[]).length : null,
        imgs:e? e.querySelectorAll('img').length:null,
        videos:e? e.querySelectorAll('video').length:null,
        buttons:e? [...e.querySelectorAll('button')].map(b=>b.getAttribute('aria-label')).filter(Boolean).slice(0,6):null,
        overflowsRight: e? e.getBoundingClientRect().right>inner+1 : null,
        docScroll:document.documentElement.scrollWidth, viewport:inner};},{ch,tag,chips});
  };
  out.threeFiles=await send(['qa-s2-m1.png','qa-s2-m2.png','qa-s2-m3.txt'],'QA-V5-MULTI');
  out.video=await send(['qa-s2-clip.mp4'],'QA-V5-VIDEO');
  out.zip=await send(['qa-s2-bundle.zip'],'QA-V5-ZIP');
  await empty();
  return out;
};
