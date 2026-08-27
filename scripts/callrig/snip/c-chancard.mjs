export default async ({page}) => {
  const WS='W4QCF1XTURESO01', CH='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${CH}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(()=>{
    const msgs=[...document.querySelectorAll('[data-message-id]')];
    const last=msgs.slice(-3).map(m=>({txt:(m.innerText||'').replace(/\n+/g,' | ').slice(0,160),
      icons:[...m.querySelectorAll('svg')].map(s=>s.getAttribute('class')||'').filter(c=>/lucide/.test(c)).slice(0,3),
      links:[...m.querySelectorAll('a,button')].map(a=>(a.getAttribute('aria-label')||a.textContent||'').trim().slice(0,30)).filter(Boolean).slice(0,4)}));
    return {count:msgs.length, last};
  });
};
