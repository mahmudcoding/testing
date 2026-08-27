export default async ({page}) => page.evaluate(()=>{
  const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
  const main=document.querySelector('main');
  return {url:location.pathname+location.search,
    mainText:main?(main.innerText||'').replace(/\s+/g,' ').trim().slice(0,140):'NO-MAIN',
    composer:!!document.querySelector('div[contenteditable][aria-label="Compose message"]'),
    messages:document.querySelectorAll('main [data-message-id]').length,
    visibleHeadings:[...document.querySelectorAll('h1,h2,h3')].filter(v)
      .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,30)).slice(0,5)};
});
