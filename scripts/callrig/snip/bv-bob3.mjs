export default async ({page}) => {
  const out={}
  out.declined = await page.evaluate(()=>({txt:document.body.innerText.replace(/\s+/g,' ').slice(-200),
    btns:[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
      .map(b=>(b.innerText||'').trim()).filter(t=>/request|join|back/i.test(t))}))
  out.reRequested = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^(Request to join again|Ask to join|Join|Request to join)$/i.test((x.innerText||'').trim()))
    if(b&&!b.disabled){b.click(); return (b.innerText||'').trim()} return null
  })
  await page.waitForTimeout(6000)
  out.after = await page.evaluate(()=>({txt:document.body.innerText.replace(/\s+/g,' ').slice(-160),
    btns:[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
      .map(b=>(b.innerText||'').trim()).filter(t=>/cancel|back to workspace|request/i.test(t))}))
  return out
}
