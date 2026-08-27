export default async ({page}) => {
  const sel = 'div[contenteditable="true"][aria-label="Compose message"]';
  const r = await page.evaluate((sel) => {
    const btn = [...document.querySelectorAll('button')].find(b => /cancel editing/i.test(b.getAttribute('aria-label')||''));
    if (btn) btn.click();
    const ed = document.querySelector(sel);
    return {cancelled: !!btn, composerText: ed ? (ed.innerText||'').slice(0,80) : null};
  }, sel);
  await page.waitForTimeout(800);
  const after = await page.evaluate((sel)=>{const e=document.querySelector(sel);return e?(e.innerText||'').slice(0,80):null;}, sel);
  return {...r, afterCancel: after};
};
