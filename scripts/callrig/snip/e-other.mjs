export default async ({page}) => {
  const WS='W4QEF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  return await page.evaluate(()=>{
    const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
    // find the element whose text is exactly OTHER
    const heads=[...document.querySelectorAll('*')].filter(vis)
      .filter(e=>e.children.length===0 && /^(OTHER|[A-Z][A-Z \-]{1,24})$/.test(e.textContent.trim()) && e.textContent.trim().length<26);
    const info=heads.map(h=>({txt:h.textContent.trim(), tag:h.tagName,
      cls:(h.className||'').toString().slice(0,50),
      parentTxt:(h.parentElement?h.parentElement.innerText:'').replace(/\n/g,' ').slice(0,60)}));
    // any grouping control?
    const controls=[...document.querySelectorAll('main button,main select,main [role=combobox]')].filter(vis)
      .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\n/g,' ').trim()).filter(Boolean)
      .filter(t=>/group|sort|filter|role|team|department/i.test(t));
    return {headings:info.slice(0,8), groupingControls:controls,
      mainHead:(document.querySelector('main')||document.body).innerText.replace(/\n{2,}/g,' | ').slice(0,200)};
  });
};
