export default async ({page}) => {
  const out={};
  await page.goto(process.env.QA_LINK, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const fillName = async (v) => { const i = await page.$('input[type=text]'); if(i){ await i.click(); await i.fill(v); } return !!i; };
  out.named = await fillName('DenyProbe');
  await page.waitForTimeout(500);
  out.s1btn = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^(Continue|Ask to join)$/i.test((x.innerText||'').trim())); return b? {t:(b.innerText||'').trim(), disabled:b.disabled}:null; });
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^(Continue|Ask to join)$/i.test((x.innerText||'').trim())); if(b&&!b.disabled) b.click(); });
  await page.waitForTimeout(4500);
  out.s2 = await page.evaluate(()=>({txt:document.body.innerText.replace(/\s+/g,' ').slice(0,200), nameVal:(document.querySelector('input[type=text]')||{}).value, hasPw:!!document.querySelector('input[type=password]')}));
  // fill both again (name may have reset) and continue
  await fillName('DenyProbe');
  const pw = await page.$('input[type=password]'); if(pw){ await pw.click(); await pw.fill('Secret123'); }
  await page.waitForTimeout(500);
  out.s2btn = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^(Continue|Ask to join)$/i.test((x.innerText||'').trim())); return b? {t:(b.innerText||'').trim(), disabled:b.disabled}:null; });
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^(Continue|Ask to join)$/i.test((x.innerText||'').trim())); if(b&&!b.disabled) b.click(); });
  await page.waitForTimeout(6000);
  out.s3 = await page.evaluate(()=>({txt:document.body.innerText.replace(/\s+/g,' ').slice(0,240), url:location.href,
    btns:[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).map(b=>(b.innerText||'').trim()).filter(Boolean).slice(0,8)}));
  return out;
};
