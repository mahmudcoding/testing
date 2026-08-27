export default async ({page}) => {
  const out={}
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/calls',{waitUntil:'domcontentloaded'})
  await page.waitForTimeout(5000)
  await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0)
    .find(x=>/^Start now$/i.test((x.innerText||'').trim())); if(b) b.click()})
  await page.waitForTimeout(2500)
  const n=await page.$('[role=dialog] input[aria-label="Call name"]')
  if(n){await n.click(); await n.fill('QA verify log')}
  await page.evaluate(()=>{for(const v of ['public','manual_admit']){
    const r=[...document.querySelectorAll('[role=dialog] input[type=radio]')].find(i=>i.value===v); if(r) r.click()}})
  await page.waitForTimeout(700)
  out.radios = await page.evaluate(()=>[...document.querySelectorAll('[role=dialog] input[type=radio]')].filter(i=>i.checked).map(i=>i.value))
  await page.evaluate(()=>{const b=[...document.querySelectorAll('[role=dialog] button')].filter(x=>x.getBoundingClientRect().width>0)
    .find(x=>/^Start call$/i.test((x.innerText||'').trim())); if(b) b.click()})
  await page.waitForTimeout(9000)
  out.meeting = await page.evaluate(async()=>{
    try{const r=await fetch('/api/v1/meetings/current',{credentials:'include'});const j=await r.json()
      const m=j?.meeting??j?.data?.meeting??j?.data??j
      return {id:m?.id, name:m?.name, requires_approval:m?.requires_approval}}catch(e){return{err:String(e).slice(0,60)}}
  })
  out.url = page.url().slice(0,100)
  return out
}
