export default async ({page}) => {
  return await page.evaluate(()=>{
    const s=document.querySelector('[data-testid="call-ended-surface"]')||document.querySelector('[data-testid*="ended" i]');
    const all=[...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')).filter(t=>/end|summary|transcript|rating|recording/i.test(t));
    return {
      url: location.href,
      endedSurface: s?{testid:s.getAttribute('data-testid'), text:s.innerText.replace(/\n+/g,' | ').slice(0,900)}:null,
      relevantTestids:[...new Set(all)],
      buttons:[...document.querySelectorAll('button')].map(b=>({l:(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,40),t:b.getAttribute('data-testid')})).filter(b=>b.l).slice(0,30),
      bodyText:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(0,600)
    };
  });
};
