export default async ({page}) => {
  await page.locator('button[aria-label="Cancel editing"]').first().click({timeout:6000}).catch(()=>{});
  await page.waitForTimeout(2500);
  return page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const c=document.querySelector('div[contenteditable="true"][aria-label="Compose message"]');
    return {composerText:c?(c.innerText||'').trim().slice(0,26):'none',
      buttons:[...new Set([...document.querySelectorAll('button[aria-label]')].filter(v)
        .map(b=>b.getAttribute('aria-label')).filter(t=>/Save changes|Cancel editing|^Send$/.test(t)))]};});
};
