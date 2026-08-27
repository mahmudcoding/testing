export default async ({page}) => {
  const out={};
  await page.goto(process.env.QA_LINK, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5500);
  out.url = page.url();
  out.me = await page.evaluate(async()=>{ const r=await fetch('/api/v1/auth/me',{credentials:'include'}); const j=await r.json().catch(()=>null); return {s:r.status, email:j&&j.email}; });
  out.screen = await page.evaluate(()=>({
    text: document.body.innerText.replace(/\n{2,}/g,'\n').slice(0,800),
    buttons: [...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0).map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,25),
    inputs: [...document.querySelectorAll('input')].filter(i=>i.getBoundingClientRect().width>0).map(i=>({t:i.type, ph:i.placeholder, lab:i.getAttribute('aria-label')})).slice(0,10)
  }));
  return out;
};
