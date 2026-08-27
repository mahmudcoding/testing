export default async ({page}) => {
  const btns=await page.$$('button');
  for (const b of btns){ const l=((await b.getAttribute('aria-label'))||'').trim(); if(/^Notifications/.test(l)){ await b.click(); break; } }
  await page.waitForTimeout(3000);
  return await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"],[role="menu"],aside')].filter(m=>/notification/i.test(m.innerText));
    const m=ms[ms.length-1];
    return m?{text:m.innerText.replace(/\n+/g,' | ').slice(0,700),
      rows:[...m.querySelectorAll('li,[role="listitem"],a')].map(e=>e.innerText.replace(/\n+/g,' | ').slice(0,110)).filter(Boolean).slice(0,8)}
      :{none:true, body:(document.body.innerText.match(/.{0,80}Missed.{0,80}/g)||[]).slice(0,3)};
  });
};
