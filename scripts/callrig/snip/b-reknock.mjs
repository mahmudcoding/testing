export default async ({page}) => {
  const out={};
  out.clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].find(x=>/Request to join again/i.test((x.innerText||'').trim()));
    if(b){ b.click(); return true; } return false;
  });
  await page.waitForTimeout(4000);
  out.after = await page.evaluate(()=>document.body.innerText.replace(/\s+/g,' ').match(/.{0,60}(waiting|approval|declined).{0,80}/i)?.[0]||null);
  return out;
};
