export default async ({page}) => {
  const before = await page.evaluate(()=>({btn: (()=>{const b=document.querySelector('[data-testid="call-nerd-stats-toggle"]'); return b?{pressed:b.getAttribute('aria-pressed'), label:b.getAttribute('aria-label')}:null;})()}));
  const b = await page.$('[data-testid="call-nerd-stats-toggle"]');
  if (b) { await b.click(); await page.waitForTimeout(4000); }
  const after = await page.evaluate(()=>{
    const b=document.querySelector('[data-testid="call-nerd-stats-toggle"]');
    const stats=[...document.querySelectorAll('[data-testid*="stat" i],[data-testid*="nerd" i],[class*="nerd" i]')].map(e=>`${e.tagName}#${e.getAttribute('data-testid')||e.className.toString().slice(0,30)}`);
    const panel=[...document.querySelectorAll('[data-testid*="stat" i]')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,400));
    return {pressed: b?b.getAttribute('aria-pressed'):null, statEls: stats.slice(0,12), panelText: panel.slice(0,3)};
  });
  return {before, after};
};
