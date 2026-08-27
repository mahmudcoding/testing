export default async ({page}) => {
  return await page.evaluate(()=>{
    const t=document.querySelector('[data-testid="call-header-tabs"]')||document.querySelector('[data-testid="call-top-bar"]');
    return {
      topBar: (b=>b?b.innerText.replace(/\n+/g,' | ').slice(0,200):null)(document.querySelector('[data-testid="call-top-bar"]')),
      tabsTestids:[...new Set([...document.querySelectorAll('[data-testid*="tab" i],[role="tab"]')].map(e=>e.getAttribute('data-testid')||e.textContent.trim().slice(0,20)))],
      tabs:[...document.querySelectorAll('[role="tab"]')].map(e=>({l:e.textContent.trim().slice(0,26), sel:e.getAttribute('aria-selected')})),
      buttonsWithMain:[...document.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(l=>/main|back|leave room/i.test(l)).slice(0,8)
    };
  });
};
