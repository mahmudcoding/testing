import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const which = process.env.QA_PICK || 'Select microphone';
  await page.mouse.move(700,500); await page.waitForTimeout(400);
  await page.keyboard.press('Escape').catch(()=>{});
  const before = await page.evaluate((v)=>{const vis=eval(v);
    return [...document.querySelectorAll('[role="menu"],[role="listbox"],[role="dialog"],[data-radix-popper-content-wrapper]')].filter(vis).length;}, VIS);
  await page.locator(`button[aria-label="${which}"]`).first().click();
  await page.waitForTimeout(2500);
  return await page.evaluate(([b,v])=>{ const vis=eval(v);
    const all=[...document.querySelectorAll('[role="menu"],[role="listbox"],[role="dialog"],[data-radix-popper-content-wrapper],[data-radix-menu-content]')].filter(vis);
    return {before:b, now:all.length,
      nodes: all.map(m=>{const r=m.getBoundingClientRect();
        return {tid:m.getAttribute('data-testid'), role:m.getAttribute('role'),
          box:`${Math.round(r.width)}x${Math.round(r.height)}`,
          txt:(m.innerText||'').replace(/\s+/g,' ').slice(0,180)};}).slice(0,5),
      // fall back: any newly visible element with device-ish text
      devText: [...document.querySelectorAll('*')].filter(e=>!e.childElementCount).filter(vis)
        .map(e=>(e.textContent||'').trim()).filter(t=>/default|microphone|camera|Fake|audio|video/i.test(t)).slice(0,10)}; }, [before, VIS]);
};
