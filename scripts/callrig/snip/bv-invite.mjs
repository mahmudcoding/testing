export default async ({page}) => {
  const out={}
  out.toolbar = await page.evaluate(()=>[...document.querySelectorAll('button')]
    .filter(b=>b.getBoundingClientRect().width>0)
    .map(b=>((b.getAttribute('aria-label')||b.innerText||'').trim()).slice(0,40)).filter(Boolean).slice(0,40))
  const clicked = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^Add to call$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()))
    if(b){b.click(); return true} return false
  })
  out.clickedAdd = clicked
  await page.waitForTimeout(2500)
  out.panel = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog],[role=menu]')].filter(x=>x.getBoundingClientRect().width>0)[0]
    if(!d) return null
    return {text:d.innerText.replace(/\s+/g,' ').slice(0,400),
      buttons:[...d.querySelectorAll('button,[role=tab],a')].filter(b=>b.getBoundingClientRect().width>0)
        .map(b=>((b.getAttribute('aria-label')||b.innerText||'').trim()).slice(0,40)).filter(Boolean)}
  })
  return out
}
