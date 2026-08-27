export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/appearance`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  return await page.evaluate(()=>{
    const m=document.querySelector('main');
    const out=[];
    m.querySelectorAll('button').forEach(b=>{
      const r=b.getBoundingClientRect(); if(r.width<=0||r.height<=0) return;
      const label=(b.innerText||'').trim().replace(/\s+/g,' ').slice(0,26) || b.getAttribute('aria-label') || '(no text)';
      out.push({label, pressed:b.getAttribute('aria-pressed'), checked:b.getAttribute('aria-checked'),
                role:b.getAttribute('role'), dataState:b.getAttribute('data-state'),
                title:(b.getAttribute('title')||'').slice(0,24)});
    });
    const headings=[]; m.querySelectorAll('h1,h2,h3,h4').forEach(h=>{const t=(h.innerText||'').trim(); if(t) headings.push(t.slice(0,32));});
    return {controls:out, headings};
  });
};
