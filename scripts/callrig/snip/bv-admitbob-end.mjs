export default async ({page}) => {
  const out={}
  out.admitted = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^Admit QA Bob$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()))
    if(b){b.click(); return true} return false
  })
  await page.waitForTimeout(9000)
  out.rosterButtons = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
    .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(t=>/^(Admit|Deny)/i.test(t)))
  // end the call
  await page.evaluate(()=>{const b=document.querySelector('[data-testid="call-controls-end-for-everyone"]'); if(b) b.click()})
  await page.waitForTimeout(2500)
  out.ended = await page.evaluate(()=>{const b=document.querySelector('[data-testid="call-end-confirm-submit"]'); if(b){b.click(); return true} return false})
  await page.waitForTimeout(8000)
  out.url = page.url().slice(0,90)
  return out
}
