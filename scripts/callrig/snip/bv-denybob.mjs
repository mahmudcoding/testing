export default async ({page}) => {
  const out={}
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
    .find(x=>/^Participants$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim())); if(b) b.click()})
  await page.waitForTimeout(3000)
  out.waiting = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
    .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(t=>/^(Admit|Deny)/i.test(t)))
  out.denied = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^Deny QA Bob$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()))
    if(b){b.click(); return true} return false
  })
  await page.waitForTimeout(5000)
  out.after = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
    .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(t=>/^(Admit|Deny)/i.test(t)))
  return out
}
