export default async ({page}) => {
  const out={}
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/call/V4OWE208I6GA6OU',{waitUntil:'domcontentloaded'})
  await page.waitForTimeout(8000)
  out.clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^(Join|Join call|Ask to join|Request to join)$/i.test((x.innerText||'').trim()))
    if(b&&!b.disabled){b.click(); return (b.innerText||'').trim()} return null
  })
  await page.waitForTimeout(6000)
  out.state = await page.evaluate(()=>({txt:document.body.innerText.replace(/\s+/g,' ').slice(-160),
    btns:[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
      .map(b=>(b.innerText||'').trim()).filter(t=>/cancel|back to workspace|request/i.test(t))}))
  return out
}
