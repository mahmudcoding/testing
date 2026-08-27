export default async ({page}) => {
  const out={}
  out.clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^End for everyone$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()))
    if(b){b.click(); return true} return false
  })
  await page.waitForTimeout(2500)
  out.confirmDialog = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/end/i.test(x.innerText))
    if(!d) return null
    return {text:d.innerText.replace(/\s+/g,' ').slice(0,200),
      buttons:[...d.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0).map(b=>(b.innerText||'').trim())}
  })
  out.confirmed = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/end/i.test(x.innerText))
    const scope = d || document
    const b=[...scope.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^(End call|End for everyone|End)$/i.test((x.innerText||'').trim()) && !/^End for everyone$/i.test((x.getAttribute('aria-label')||'').trim()))
    if(b){b.click(); return (b.innerText||'').trim()} return null
  })
  await page.waitForTimeout(7000)
  out.url = page.url().slice(0,110)
  out.cur = await page.evaluate(async()=>{
    try{const r=await fetch('/api/v1/meetings/current',{credentials:'include'});return r.status}catch(e){return 'err'}
  })
  return out
}
