export default async ({page}) => {
  const out={}
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/calls', {waitUntil:'domcontentloaded'})
  await page.waitForTimeout(4000)
  out.url0 = page.url()
  const clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^Start now$/i.test((x.innerText||'').trim()))
    if(b){b.click(); return true} return false
  })
  out.clickedStartNow = clicked
  await page.waitForTimeout(2500)
  out.dialog = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0]
    if(!d) return null
    return {
      text: d.innerText.replace(/\s+/g,' ').slice(0,700),
      buttons: [...d.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
        .map(b=>({t:(b.innerText||'').trim().slice(0,40), al:b.getAttribute('aria-label'), checked:b.getAttribute('aria-checked')})),
      inputs: [...d.querySelectorAll('input,textarea')].map(i=>({t:i.type, ph:i.placeholder, v:String(i.value).slice(0,30), al:i.getAttribute('aria-label')}))
    }
  })
  return out
}
