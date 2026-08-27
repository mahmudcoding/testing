export default async ({page}) => {
  const ws='W4QCF1XTURESO01', ch='C4QCGENERAL0001';
  await page.goto(`https://airion-cargo.store/w/${ws}/c/${ch}`);
  await page.waitForTimeout(10000);
  const seen=[]; const t0=Date.now();
  while(Date.now()-t0 < 70000){
    const s=await page.evaluate(()=>[...document.querySelectorAll('[aria-live]')]
      .map(r=>(r.textContent||'').trim()).filter(Boolean));
    for(const x of s) if(!seen.includes(x)) seen.push(x);
    if(seen.some(x=>/is typing/i.test(x)) && seen.some(x=>/New message/i.test(x))) break;
    await page.waitForTimeout(250);
  }
  const typing=seen.find(x=>/is typing/i.test(x));
  const msg=seen.find(x=>/New message/i.test(x));
  return {announcements:seen.slice(-5),
    typing, typingHasEscapes: typing? /\\/.test(typing) : null,
    message: msg, messageHasEscapes: msg? /\\/.test(msg) : null};
};
