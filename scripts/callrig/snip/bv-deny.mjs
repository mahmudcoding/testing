export default async ({page}) => {
  const out={}
  out.denied = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^Deny VerifyGuest1$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()))
    if(b){b.click(); return true} return false
  })
  await page.waitForTimeout(3000)
  out.admittedBob = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^Admit QA Bob$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()))
    if(b){b.click(); return true} return false
  })
  await page.waitForTimeout(4000)
  out.after = await page.evaluate(()=>{
    const leaf=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&/Participants/i.test(e.textContent||''))[0]
    let box=leaf; for(let i=0;i<7&&box?.parentElement;i++) box=box.parentElement
    return box? box.innerText.replace(/\s+/g,' ').slice(0,300) : null
  })
  return out
}
