export default async ({page}) => {
  const out={};
  out.incoming = await page.evaluate(()=>{
    const vis = el => el.getBoundingClientRect().width>0;
    return { has:/incoming call/i.test(document.body.innerText),
      btns:[...document.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(t=>/accept|decline/i.test(t)) };
  });
  out.clicked = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/^Decline$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim())); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(4000);
  out.after = await page.evaluate(()=>({txt:document.body.innerText.replace(/\s+/g,' ').slice(0,200), stillIncoming:/incoming call/i.test(document.body.innerText)}));
  return out;
};
