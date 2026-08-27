export default async ({page}) => {
  const out={}
  const dlg = async () => page.evaluateHandle(()=>[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0)[0])
  const nameInput = await page.$('[role=dialog] input[aria-label="Call name"]')
  if(nameInput){ await nameInput.click(); await nameInput.fill('QA verify admit') }
  out.named = !!nameInput
  out.picked = await page.evaluate(()=>{
    const res={}
    for (const v of ['public','manual_admit']) {
      const r=[...document.querySelectorAll('[role=dialog] input[type=radio]')].find(i=>i.value===v)
      if(r){ r.click(); res[v]=true } else res[v]=false
    }
    return res
  })
  await page.waitForTimeout(800)
  out.stateBefore = await page.evaluate(()=>({
    checkedRadios: [...document.querySelectorAll('[role=dialog] input[type=radio]')].filter(i=>i.checked).map(i=>i.value),
    name: document.querySelector('[role=dialog] input[aria-label="Call name"]')?.value
  }))
  await page.evaluate(()=>{
    const b=[...document.querySelectorAll('[role=dialog] button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^Start call$/i.test((x.innerText||'').trim()))
    if(b) b.click()
  })
  await page.waitForTimeout(9000)
  out.url = page.url()
  out.meeting = await page.evaluate(async ()=>{
    try{ const r=await fetch('/api/v1/meetings/current',{credentials:'include'}); const j=await r.json()
      const m=j?.meeting ?? j?.data?.meeting ?? j?.data ?? j
      return {status:r.status, id:m?.id, name:m?.name, requires_approval:m?.requires_approval, password_protected:m?.password_protected, access:m?.access_type ?? m?.type}
    }catch(e){return {err:String(e).slice(0,80)}}
  })
  return out
}
