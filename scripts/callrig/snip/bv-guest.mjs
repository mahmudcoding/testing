const LINK='https://airion-cargo.store/join/84fc18efce88ab12256937cc8d28df10f4f2d40b4e5bb021653d00d315377064'
const SEL='button,a,[role=button],[role=link],input,select,summary,textarea,[tabindex]:not([tabindex="-1"])'
export default async ({page}) => {
  const out={}
  await page.goto(LINK,{waitUntil:'domcontentloaded'})
  await page.waitForTimeout(6000)
  out.me = await page.evaluate(async()=>{try{const r=await fetch('/api/v1/auth/me',{credentials:'include'});return r.status}catch(e){return 'err'}})
  const snap = () => page.evaluate((SEL)=>{
    const vis = el => {
      const r=el.getBoundingClientRect(); if(r.width===0||r.height===0) return false
      let n=el, op=1
      while(n && n.nodeType===1){ const cs=getComputedStyle(n)
        if(cs.display==='none'||cs.visibility==='hidden') return false
        op*= parseFloat(cs.opacity||'1'); n=n.parentElement }
      return op>0.01
    }
    const els=[...document.querySelectorAll(SEL)]
    return {
      t: Date.now(),
      txt: document.body.innerText.replace(/\s+/g,' ').slice(0,200),
      total: els.length,
      visible: els.filter(vis).map(e=>((e.getAttribute('aria-label')||e.innerText||e.placeholder||'').trim()||e.tagName+':'+e.type).slice(0,40)),
      hidden: els.filter(e=>!vis(e)).map(e=>((e.getAttribute('aria-label')||e.innerText||e.placeholder||'').trim()||e.tagName+':'+e.type).slice(0,40))
    }
  }, SEL)
  out.step1_nameScreen = await snap()
  const i=await page.$('input[type=text]')
  if(i){ await i.click(); await i.fill('VerifyGuest1') }
  await page.waitForTimeout(500)
  out.filledName = !!i
  // poll from BEFORE the click, uncapped, 300ms
  const frames=[]
  const t0=Date.now()
  const clicker = page.evaluate(()=>{
    const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^(Continue|Ask to join|Join)$/i.test((x.innerText||'').trim()))
    if(b&&!b.disabled){b.click(); return (b.innerText||'').trim()} return null
  })
  out.clickedLabel = await clicker
  while(Date.now()-t0 < 25000){
    frames.push(await snap())
    await page.waitForTimeout(300)
  }
  out.url = page.url()
  // collapse frames into distinct screens
  const seen=[]
  for(const f of frames){
    const key=f.txt.slice(0,80)+'|'+f.visible.join(',')
    if(!seen.length || seen[seen.length-1].key!==key) seen.push({key, at:((f.t-t0)/1000).toFixed(1)+'s', txt:f.txt.slice(0,150), total:f.total, visible:f.visible, hidden:f.hidden})
  }
  out.screens=seen
  out.frameCount=frames.length
  return out
}
