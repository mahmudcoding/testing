export default async ({page}) => {
  const state = async () => await page.evaluate(()=>{
    const b=(re)=>[...document.querySelectorAll('button')]
      .find(x=>re.test((x.getAttribute('aria-label')||'').trim()));
    const mic=b(/^(Mute|Unmute)$/), cam=b(/^Turn camera (on|off)$/);
    return {mic:mic?mic.getAttribute('aria-label'):null,
            cam:cam?cam.getAttribute('aria-label'):null,
            dialog:(()=>{const d=[...document.querySelectorAll('[role="dialog"],[role="alertdialog"]')]
              .map(e=>e.innerText.replace(/\n+/g,' ').slice(0,50)).filter(t=>/Leave this call/i.test(t));
              return d[0]||null;})()};
  });
  const out={before: await state()};
  await page.evaluate(()=>{ const m=document.querySelector('main')||document.body; m.click&&m.click(); });
  await page.waitForTimeout(300);
  const key = process.env.QA_KEY || 'Meta+d';
  await page.keyboard.press(key);
  await page.waitForTimeout(2500);
  out.after = await state();
  out.key = key;
  return out;
};
