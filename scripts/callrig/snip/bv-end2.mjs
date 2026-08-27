export default async ({page}) => {
  const out={}
  out.clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^End for everyone$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()))
    if(b){b.click(); return true} return false
  })
  await page.waitForTimeout(3000)
  out.testids = await page.evaluate(()=>[...document.querySelectorAll('[data-testid]')].filter(e=>e.getBoundingClientRect().width>0)
    .map(e=>e.getAttribute('data-testid')).filter(t=>/end|confirm/i.test(t)))
  out.submitted = await page.evaluate(()=>{
    const b=document.querySelector('[data-testid="call-end-confirm-submit"]')
    if(b){b.click(); return 'testid'} 
    return null
  })
  await page.waitForTimeout(7000)
  out.cur = await page.evaluate(async()=>{try{const r=await fetch('/api/v1/meetings/current',{credentials:'include'});return r.status}catch(e){return 'err'}})
  out.url = page.url().slice(0,110)
  return out
}
