export default async ({page}) => {
  const out={};
  const comp=page.locator('div[contenteditable="true"][aria-label="Compose message"]');
  const clear=async()=>{await comp.click();await page.keyboard.press('Control+A');await page.keyboard.press('Backspace');await page.waitForTimeout(250);
    return comp.evaluate(e=>e.innerText.trim());};

  // 1. emoji shortcode
  out.cleared1=await clear();
  await comp.type(':smile:', {delay:60}); await page.waitForTimeout(1200);
  out.shortcodeInComposer = await comp.evaluate(e=>e.innerText.slice(0,40));
  out.shortcodePicker = await page.evaluate(()=>[...document.querySelectorAll('[role="option"]')]
    .filter(e=>e.getBoundingClientRect().height>0).map(e=>e.textContent.trim().slice(0,20)).slice(0,6));
  await comp.type(' QA-S2-SHORTCODE', {delay:30}); await page.waitForTimeout(400);
  await page.keyboard.press('Enter'); await page.waitForTimeout(2500);
  out.shortcodeSent = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('main [data-message-id]')].reverse()
      .find(e=>/QA-S2-SHORTCODE/.test(e.innerText||''));
    return el? (el.innerText||'').replace(/\s+/g,' ').slice(0,70):'not found';});

  // 2. slash command
  out.cleared2=await clear();
  await comp.type('/', {delay:60}); await page.waitForTimeout(1200);
  out.slashPicker = await page.evaluate(()=>[...document.querySelectorAll('[role="option"],[role="listbox"] *')]
    .filter(e=>e.getBoundingClientRect().height>6).map(e=>e.textContent.trim().slice(0,22)).slice(0,8));
  await clear();
  return out;
};
