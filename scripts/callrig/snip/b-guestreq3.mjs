export default async ({page}) => {
  const out={};
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/^Leave call$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim())); if(b) b.click(); });
  await page.waitForTimeout(2000);
  await page.evaluate(()=>{ const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/Leave this call\?/i.test(x.innerText)); if(d){ const b=[...d.querySelectorAll('button')].find(y=>(y.innerText||'').trim()==='Leave'); if(b) b.click(); } });
  await page.waitForTimeout(4000);
  await page.goto(process.env.QA_LINK, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const fillName = async v => { const i=await page.$('input[type=text]'); if(i){await i.click(); await i.fill(v);} return !!i; };
  await fillName('DenyProbe2');
  await page.waitForTimeout(400);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^(Continue|Ask to join)$/i.test((x.innerText||'').trim())); if(b&&!b.disabled) b.click(); });
  await page.waitForTimeout(4500);
  await fillName('DenyProbe2');
  const pw=await page.$('input[type=password]'); if(pw){await pw.click(); await pw.fill('Secret123');}
  await page.waitForTimeout(400);
  out.stepText = await page.evaluate(()=>document.body.innerText.replace(/\s+/g,' ').slice(0,220));
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^(Continue|Ask to join)$/i.test((x.innerText||'').trim())); if(b&&!b.disabled) b.click(); });
  await page.waitForTimeout(6000);
  out.waiting = await page.evaluate(()=>({txt:document.body.innerText.replace(/\s+/g,' ').slice(0,240), url:location.href,
    interactive:[...document.querySelectorAll('button,a,[role=button],input,[tabindex]:not([tabindex="-1"])')].length}));
  return out;
};
