export default async ({page}) => {
  const out={};
  // leave the call as guest
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/^Leave call$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim())); if(b) b.click(); });
  await page.waitForTimeout(2000);
  await page.evaluate(()=>{ const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/Leave this call\?/i.test(x.innerText)); if(d){ const b=[...d.querySelectorAll('button')].find(y=>(y.innerText||'').trim()==='Leave'); if(b) b.click(); } });
  await page.waitForTimeout(4000);
  out.afterLeave = await page.evaluate(()=>({url:location.href, txt:document.body.innerText.replace(/\s+/g,' ').slice(0,180)}));
  // reopen the invite link and request again
  await page.goto(process.env.QA_LINK, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  out.step1 = await page.evaluate(()=>({txt:document.body.innerText.replace(/\s+/g,' ').slice(0,220), inputs:[...document.querySelectorAll('input')].filter(i=>i.getBoundingClientRect().width>0).map(i=>i.type)}));
  const nameI = await page.$('input[type=text]');
  if (nameI) await nameI.fill('DenyProbe');
  const pwI = await page.$('input[type=password]');
  if (pwI) await pwI.fill('Secret123');
  await page.waitForTimeout(400);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^(Continue|Ask to join)$/i.test((x.innerText||'').trim())); if(b&&!b.disabled) b.click(); });
  await page.waitForTimeout(5000);
  out.step2 = await page.evaluate(()=>({txt:document.body.innerText.replace(/\s+/g,' ').slice(0,260), buttons:[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).map(b=>(b.innerText||'').trim()).filter(Boolean).slice(0,10)}));
  // if a second step (Ask to join) appears, press it
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^Ask to join$/i.test((x.innerText||'').trim())); if(b&&!b.disabled) b.click(); });
  await page.waitForTimeout(5000);
  out.step3 = await page.evaluate(()=>({txt:document.body.innerText.replace(/\s+/g,' ').slice(0,260), url:location.href}));
  return out;
};
