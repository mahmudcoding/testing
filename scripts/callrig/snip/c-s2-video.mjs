const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  const out={};
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  await comp.click(); await page.keyboard.press('Control+A'); await page.keyboard.press('Backspace');
  await page.waitForTimeout(300);
  await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-clip.mp4`);
  await page.waitForTimeout(3000);
  await comp.click(); await comp.type('QA-S2-VIDEO', {delay:35});
  await page.waitForTimeout(300);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(7000);
  out.msg = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(e=>/QA-S2-VIDEO/.test(e.innerText||''));
    if(!el) return 'not rendered';
    const v=el.querySelector('video');
    return {id:el.getAttribute('data-message-id'),
      hasVideo:!!v, videoAttrs: v? {src:(v.currentSrc||v.src||'').slice(-40), controls:v.controls,
        rw:v.videoWidth, rh:v.videoHeight, dur:v.duration, readyState:v.readyState}:null,
      imgs:[...el.querySelectorAll('img')].length,
      text:(el.innerText||'').replace(/\s+/g,' ').slice(0,110),
      buttons:[...el.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().height>0)
        .map(b=>b.getAttribute('aria-label')||b.textContent.trim().slice(0,22)).slice(0,12)};
  });
  return out;
};
