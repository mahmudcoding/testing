export default async ({page}) => {
  const out={}
  out.openedParticipants = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^Participants$/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()))
    if(b){b.click(); return true} return false
  })
  await page.waitForTimeout(3000)
  out.waitingButtons = await page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>b.getBoundingClientRect().width>0)
    .map(b=>(b.getAttribute('aria-label')||b.innerText||'').trim()).filter(t=>/^(Admit|Deny)/i.test(t)))
  out.admitted = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^Admit (?!all)/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()))
    if(b){b.click(); return (b.getAttribute('aria-label')||b.innerText||'').trim()} return null
  })
  await page.waitForTimeout(5000)
  out.roster = await page.evaluate(async()=>{
    try{const r=await fetch('/api/v1/meetings/current',{credentials:'include'});const j=await r.json()
      const m=j?.meeting??j?.data?.meeting??j?.data??j
      return {n:(m?.participants||[]).length}
    }catch(e){return {err:String(e).slice(0,60)}}
  })
  return out
}
