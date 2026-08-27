export default async ({page}) => {
  const out={}
  out.hasInviteText = await page.evaluate(()=>document.body.innerText.includes('Invite link'))
  if(!out.hasInviteText){
    await page.evaluate(()=>{
      const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
        .find(x=>/^Add to call$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()))
      if(b) b.click()
    })
    await page.waitForTimeout(2500)
    out.hasInviteText = await page.evaluate(()=>document.body.innerText.includes('Invite link'))
  }
  // find the element holding "Invite link" and describe its container
  out.ctx = await page.evaluate(()=>{
    const all=[...document.querySelectorAll('*')].filter(e=>e.children.length===0 && /Invite link/i.test(e.textContent||''))
    if(!all.length) return null
    const leaf=all[0]
    let box=leaf; for(let i=0;i<6 && box.parentElement;i++) box=box.parentElement
    return {
      text: box.innerText.replace(/\s+/g,' ').slice(0,500),
      controls: [...box.querySelectorAll('button,[role=tab],a,input')].filter(b=>b.getBoundingClientRect().width>0)
        .map(b=>({t:((b.getAttribute('aria-label')||b.innerText||'').trim()).slice(0,40), tag:b.tagName, v:b.value?String(b.value).slice(0,120):undefined}))
    }
  })
  return out
}
