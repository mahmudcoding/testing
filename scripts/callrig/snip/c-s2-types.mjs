const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  const out={};
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const clear=async()=>{await comp.click();await page.keyboard.press('Control+A');await page.keyboard.press('Backspace');await page.waitForTimeout(250);};
  const run=async(file,tag)=>{
    await clear();
    await page.locator('input[type=file]').first().setInputFiles(`${DIR}/${file}`);
    await page.waitForTimeout(3500);
    const err=await page.evaluate((f)=>[...document.querySelectorAll('*')]
      .filter(e=>e.children.length===0 && /unsupported|too large|error|failed/i.test(e.textContent||''))
      .map(e=>e.textContent.trim().slice(0,70)).slice(0,3), file);
    if (err.length) return {file, rejected:err};
    await comp.click(); await comp.type(tag,{delay:30}); await page.waitForTimeout(300);
    await page.keyboard.press('Enter'); await page.waitForTimeout(7000);
    return page.evaluate((tag)=>{
      const el=[...document.querySelectorAll('main [data-message-id]')].reverse()
        .find(e=>new RegExp(tag).test(e.innerText||''));
      if(!el) return {tag, sent:false};
      const a=el.querySelector('audio');
      return {tag, sent:true, hasAudio:!!a,
        audio: a? {controls:a.controls, dur:a.duration, src:(a.currentSrc||a.src||'').slice(-30)}:null,
        text:(el.innerText||'').replace(/\s+/g,' ').slice(0,90),
        buttons:[...el.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().height>0)
          .map(b=>b.getAttribute('aria-label')||b.textContent.trim().slice(0,20)).slice(0,10)};
    }, tag);
  };
  out.wav=await run('qa-s2-tone.wav','QA-S2-WAV');
  out.zip=await run('qa-s2-bundle.zip','QA-S2-ZIP');
  return out;
};
