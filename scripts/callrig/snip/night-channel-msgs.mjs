export default async ({page}) => {
  const ch=process.env.QA_CH||'C4QAGENERAL0001';
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/c/'+ch,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(()=>{
    const rows=[...document.querySelectorAll('[data-message-id]')].slice(-6).map(r=>({
      id:r.getAttribute('data-message-id'),
      text:r.innerText.replace(/\n+/g,' | ').slice(0,140),
      h:Math.round(r.getBoundingClientRect().height)
    }));
    return {count: document.querySelectorAll('[data-message-id]').length, last: rows,
      mainTail:(document.querySelector('main')||document.body).innerText.replace(/\n+/g,' | ').slice(-350)};
  });
};
