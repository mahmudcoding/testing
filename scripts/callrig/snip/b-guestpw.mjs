export default async ({page}) => {
  const out={};
  const i = await page.$('input[type=text]');
  await i.fill('PwProbe');
  await page.waitForTimeout(400);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/^Continue$/i.test((x.innerText||'').trim())); if(b&&!b.disabled) b.click(); });
  await page.waitForTimeout(6000);
  out.step2 = await page.evaluate(()=>({
    text: document.body.innerText.replace(/\s+/g,' ').slice(0,400),
    inputs: [...document.querySelectorAll('input')].filter(x=>x.getBoundingClientRect().width>0).map(x=>({t:x.type, ph:x.placeholder})),
    buttons: [...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).map(b=>(b.innerText||b.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(0,12)
  }));
  // if a password field appeared, try the empty-string case first, then Secret123
  const pw = await page.$('input[type=password]');
  if (pw) {
    await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/join|continue/i.test((x.innerText||'').trim())); if(b&&!b.disabled) b.click(); });
    await page.waitForTimeout(3500);
    out.emptyTry = await page.evaluate(()=>document.body.innerText.replace(/\s+/g,' ').slice(0,220));
    await pw.fill('Secret123'); await page.waitForTimeout(300);
    await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/join|continue/i.test((x.innerText||'').trim())); if(b&&!b.disabled) b.click(); });
    await page.waitForTimeout(6000);
    out.secretTry = await page.evaluate(()=>({txt:document.body.innerText.replace(/\s+/g,' ').slice(0,260), url:location.href}));
  }
  return out;
};
