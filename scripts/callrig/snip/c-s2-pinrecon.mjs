export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(9000);
  return page.evaluate(()=>{
    const v=(e)=>{const r=e.getBoundingClientRect();return r.width>3&&r.height>3;};
    const btns=[...document.querySelectorAll('button,a')].filter(v)
      .map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim())
      .filter(t=>t && t.length<40);
    return {pinLike:btns.filter(t=>/pin/i.test(t)), headerish:btns.slice(0,26),
            msgs:document.querySelectorAll('main [data-message-id]').length};
  });
};
