export default async ({page}) => {
  const cur = await page.evaluate(async()=>{
    try{const r=await fetch('/api/v1/meetings/current',{credentials:'include'});const j=await r.json()
      const m=j?.meeting??j?.data?.meeting??j?.data??j
      return {status:r.status, id:m?.id, name:m?.name, requires_approval:m?.requires_approval, password_protected:m?.password_protected,
        participants:(m?.participants||[]).map(p=>p?.user?.display_name??p?.display_name??p?.name).slice(0,10)}
    }catch(e){return {err:String(e).slice(0,90)}}
  })
  const inCall = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .map(x=>((x.getAttribute('aria-label')||x.innerText||'').trim()))
    return {hasMeetingSettings:b.includes('Meeting settings'), hasLeave:b.includes('Leave call'), hasJoin:b.some(t=>/^Join$/.test(t))}
  })
  return {cur, inCall, url:page.url().slice(0,110)}
}
