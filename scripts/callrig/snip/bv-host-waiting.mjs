export default async ({page}) => {
  const out={}
  await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^Participants$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()))
    if(b) b.click()
  })
  await page.waitForTimeout(2500)
  out.panel = await page.evaluate(()=>{
    const leaf=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&/WAITING/i.test(e.textContent||''))[0]
    if(!leaf) return {none:true, bodyHas:document.body.innerText.includes('WAITING')}
    let box=leaf; for(let i=0;i<7&&box.parentElement;i++) box=box.parentElement
    return {text:box.innerText.replace(/\s+/g,' ').slice(0,400),
      buttons:[...box.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
        .map(b=>((b.getAttribute('aria-label')||b.innerText||'').trim()).slice(0,40)).filter(Boolean)}
  })
  return out
}
