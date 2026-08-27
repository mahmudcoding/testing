export default async ({page}) => {
  const out={};
  const probe=async(tag,label)=>{
    const msg=page.locator('main [data-message-id]').filter({hasText:tag}).last();
    await msg.scrollIntoViewIfNeeded();
    const btn=msg.locator(`button[aria-label="${label}"]`);
    const n=await btn.count();
    if(!n) return {tag, btn:'absent'};
    const before=await page.evaluate(()=>({dlg:!!document.querySelector('[role="dialog"]'),
      tabs:document.querySelectorAll('[role="dialog"]').length}));
    await btn.first().click();
    const samples=[];
    for(let i=0;i<8;i++){ await page.waitForTimeout(400);
      samples.push(await page.evaluate(()=>{
        const d=document.querySelector('[role="dialog"]');
        if(!d) return {dlg:false};
        return {dlg:true, txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,120),
          media:{img:d.querySelectorAll('img').length, audio:d.querySelectorAll('audio').length,
                 video:d.querySelectorAll('video').length, iframe:d.querySelectorAll('iframe').length,
                 embed:d.querySelectorAll('embed,object').length},
          btns:[...d.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().height>0)
            .map(b=>b.getAttribute('aria-label')||b.textContent.trim().slice(0,18))};
      }));
    }
    const last=samples.at(-1);
    if (last.dlg) { await page.keyboard.press('Escape'); await page.waitForTimeout(800); }
    return {tag, before, first:samples[0], last,
      closed: await page.evaluate(()=>!document.querySelector('[role="dialog"]'))};
  };
  out.zip=await probe('QA-S2-ZIP','Preview qa-s2-bundle.zip');
  out.wav=await probe('QA-S2-WAV','Preview qa-s2-tone.wav');
  return out;
};
