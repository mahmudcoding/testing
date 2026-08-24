export default async ({page}) => {
  const btn = process.env.QA_BTN;
  const el = await page.$(`button[aria-label="${btn}"]`);
  if (!el) return {err:'missing '+btn};
  await el.click();
  await page.waitForTimeout(Number(process.env.QA_WAIT||2500));
  return await page.evaluate(() => {
    const stage = document.querySelector('[data-testid="call-overlay-expanded"]') || document.body;
    return {
      text: stage.innerText.replace(/\n+/g,' | ').slice(0,1200),
      testids: [...stage.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')).slice(0,60),
      inputs: [...stage.querySelectorAll('input,textarea,[contenteditable="true"]')].map(e=>`${e.tagName.toLowerCase()}|${e.getAttribute('aria-label')||e.placeholder||''}|${e.getAttribute('data-testid')||''}`)
    };
  });
};
