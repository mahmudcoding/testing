const WS='W4QCF1XTURESO01';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`,{waitUntil:'load'});
  await page.waitForTimeout(8000);
  const out={};
  const opened = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const b=[...document.querySelectorAll('main button')].filter(vis)
      .find(x=>/Open QA Carol's profile/.test(x.getAttribute('aria-label')||''));
    if (b) { b.click(); return (b.getAttribute('aria-label')||'').slice(0,34); }
    const b2=[...document.querySelectorAll('main button')].filter(vis)
      .find(x=>/QA Carol/.test(x.textContent||'') && !/^(Call|Message)$/.test((x.textContent||'').trim()));
    if (b2) { b2.click(); return 'text:'+(b2.textContent||'').trim().slice(0,24); }
    return null;
  });
  out.clicked = opened;
  await page.waitForTimeout(2500);
  out.card = await page.evaluate(()=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis).pop();
    if (d) return {kind:'dialog', text:d.innerText.replace(/\n+/g,' | ').slice(0,200),
      buttons:[...d.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,24)).filter(Boolean)};
    const main=document.querySelector('main')||document.body;
    return {kind:'inline', url:location.href, text:main.innerText.replace(/\n+/g,' | ').slice(0,200),
      shareButtons:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(t=>/share/i.test(t))};
  });
  return out;
};
