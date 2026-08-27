export default async ({page}) => {
  const out={};
  const inp = await page.$('input[type=text]');
  const LONG = 'Guest'+'X'.repeat(200);
  await inp.fill(LONG);
  await page.waitForTimeout(400);
  out.accepted = await page.evaluate(()=>{ const i=document.querySelector('input[type=text]'); return {len:i.value.length, maxAttr:i.getAttribute('maxlength')}; });
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/Ask to join/i.test(x.innerText||'')); if(b&&!b.disabled) b.click(); });
  await page.waitForTimeout(6000);
  out.after = await page.evaluate(()=>({
    url: location.href,
    txt: document.body.innerText.replace(/\s+/g,' ').slice(0,400),
    buttons: [...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0).map(b=>(b.innerText||b.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,15)
  }));
  return out;
};
