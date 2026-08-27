export default async ({ page }) => {
  return await page.evaluate(()=>{
    const html=document.body.innerHTML;
    const navEl=document.querySelector('a[href*="/settings/"]')?.closest('nav');
    const aside=navEl?.closest('aside,div[class*="w-"]');
    return {
      pageHasFilterSettings: /Filter settings/i.test(html),
      pageHasNoSettingsMatch: /No settings match/i.test(html),
      allPageInputs: [...document.querySelectorAll('input')].map(i=>({ph:(i.placeholder||'').slice(0,28),al:(i.getAttribute('aria-label')||'').slice(0,28),type:i.type})),
      srOnlyLabels: [...document.querySelectorAll('label.sr-only,label')].map(l=>(l.innerText||l.textContent||'').trim().slice(0,30)).filter(Boolean).slice(0,12),
      navParentHTMLHead: aside? aside.outerHTML.slice(0,400) : (navEl?navEl.outerHTML.slice(0,400):'no nav'),
    };});
};
