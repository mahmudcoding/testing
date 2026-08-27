export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/call/V4OWDKLUJ7XE1PZ',{waitUntil:'domcontentloaded'})
  await page.waitForTimeout(8000)
  const out={url:page.url().slice(0,100)}
  out.buttons = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
    .map(b=>((b.getAttribute('aria-label')||b.innerText||'').trim())).filter(Boolean).slice(0,30))
  out.dialogs = await page.evaluate(()=>[...document.querySelectorAll('.aloqa-modal-backdrop')].length)
  // if a pre-join screen appeared, join
  out.joined = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^(Join|Join call|Rejoin)$/i.test((x.innerText||'').trim()))
    if(b&&!b.disabled){b.click(); return (b.innerText||'').trim()} return null
  })
  await page.waitForTimeout(6000)
  out.after = await page.evaluate(()=>({
    backdrops:[...document.querySelectorAll('.aloqa-modal-backdrop')].length,
    hasMS:[...document.querySelectorAll('button')].some(b=>/^Meeting settings$/i.test((b.getAttribute('aria-label')||b.innerText||'').trim())&&b.getBoundingClientRect().width>0)
  }))
  return out
}
