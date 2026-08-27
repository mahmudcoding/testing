export default async ({page}) => {
  const out={};
  out.clicked = await page.evaluate(()=>{
    const btns=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0 && /^Start call$/i.test((x.innerText||'').trim()));
    if(btns.length){ btns[0].click(); return btns.length; } return 0;
  });
  await page.waitForTimeout(2500);
  out.confirm = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0).pop();
    return d? {t:d.innerText.replace(/\s+/g,' ').slice(0,300), b:[...d.querySelectorAll('button')].filter(y=>y.getBoundingClientRect().width>0).map(y=>(y.innerText||'').trim()).filter(Boolean).slice(0,10)}:null;
  });
  await page.waitForTimeout(7000);
  out.url = page.url();
  out.meetingId = (page.url().match(/\/call\/([A-Za-z0-9]+)/)||[])[1] || null;
  out.txt = await page.evaluate(()=>document.body.innerText.replace(/\s+/g,' ').slice(0,250));
  return out;
};
