export default async ({page}) => {
  const url=process.env.QA_URL;
  const out={};
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const snap = async () => await page.evaluate(()=>{
    const vis = el => { const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false;
      let o=1,n=el; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden') return false; o*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return o>0.05; };
    const inputs=[...document.querySelectorAll('input,textarea')].filter(vis).map(i=>{
      const lab = (i.labels&&i.labels[0]&&i.labels[0].innerText) || i.getAttribute('aria-label') || '';
      return {t:i.type, ph:i.placeholder, req:i.required, label:lab.replace(/\s+/g,' ').trim(), v:String(i.value).slice(0,30)};
    });
    const btns=[...document.querySelectorAll('button,a[href],[role=button]')].filter(vis).map(b=>({t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,40), al:b.getAttribute('aria-label'), dis:b.disabled===true||b.getAttribute('aria-disabled')==='true'}));
    return {url:location.href, bodyText:document.body.innerText.replace(/\s+/g,' ').slice(0,400), inputs, btns};
  });
  out.initial = await snap();
  // fill the name only
  const nm = await page.$('input[type=text]');
  if (nm) { await nm.fill('Guest QA'); await page.waitForTimeout(1200); }
  out.withName = await snap();
  const pw = await page.$('input[type=password]');
  if (pw) { await pw.fill('x'); await page.waitForTimeout(1200); out.withPw = await snap(); }
  return out;
};
