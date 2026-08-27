export default async ({page}) => {
  const WS='W4QBF1XTURESO01'; const M=process.env.QA_MID;
  await page.goto(`https://staging.airion-cargo.store/w/${WS}/call/${M}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  return await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
    const t=document.body.innerText.replace(/\s+/g,' ');
    const join=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Join call$/i.test((x.innerText||'').trim()));
    return {url:location.href,
      barrier:/password-protected/i.test(t),
      tail:t.slice(-260),
      pwInputs:[...document.querySelectorAll('input[type=password]')].filter(vis).map(i=>({ph:i.placeholder, v:i.value, lab:(i.labels&&i.labels[0]&&i.labels[0].innerText)||i.getAttribute('aria-label')})),
      joinBtn: join? {disabled: join.disabled===true||join.getAttribute('aria-disabled')==='true'}:null,
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(-6)};
  });
};
