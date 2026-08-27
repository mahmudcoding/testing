const WS='W4QCF1XTURESO01', CH='C4OWKQTPC7FZ35V';
export default async ({page}) => {
  const out={};
  out.rec = await page.evaluate(()=>{
    const r=window.__rm; if(!r) return {err:'none'};
    clearInterval(r.id);
    return {events:r.events.length, all:r.events.map(e=>({ms:e.ms, msgs:e.msgs, composer:e.composer,
      toasts:e.toasts, main:e.main, vis:e.vis, url:e.url.split('/w/')[1]}))};
  });
  // and what the API says for bob now
  out.api = await page.evaluate(async (ch)=>{
    const m=await fetch(`/api/v1/messaging/channels/${ch}/messages?limit=3`,{credentials:'include'});
    return {messages:{s:m.status, b:(await m.text()).slice(0,140)}};
  }, CH);
  // then a fresh load
  await page.goto('about:blank'); await page.waitForTimeout(700);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'load'});
  await page.waitForTimeout(7500);
  out.afterReload = await page.evaluate(()=>{
    const main=document.querySelector('main')||document.body;
    return {url:location.href, main:main.innerText.replace(/\n+/g,' | ').slice(0,140),
      composer: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]'),
      msgs:document.querySelectorAll('[data-message-id]').length,
      sidebarHas: [...document.querySelectorAll('a')].some(a=>(a.getAttribute('href')||'').includes('C4OWKQTPC7FZ35V'))};
  });
  return out;
};
