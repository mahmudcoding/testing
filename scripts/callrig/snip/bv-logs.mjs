export default async ({page}) => {
  const out={}
  await page.goto('https://airion-cargo.store/w/W4QBF1XTURESO01/calls/V4OWDKLUJ7XE1PZ',{waitUntil:'domcontentloaded'})
  await page.waitForTimeout(7000)
  out.tabs = await page.evaluate(()=>[...document.querySelectorAll('[role=tab],button')].filter(b=>b.getBoundingClientRect().width>0)
    .map(b=>(b.innerText||'').trim()).filter(t=>/^(Recording|Chat|Logs)/i.test(t)))
  out.clickedLogs = await page.evaluate(()=>{
    const b=[...document.querySelectorAll('[role=tab],button')].filter(x=>x.getBoundingClientRect().width>0)
      .find(x=>/^Logs/i.test((x.innerText||'').trim()))
    if(b){b.click(); return (b.innerText||'').trim()} return null
  })
  await page.waitForTimeout(4000)
  // scroll the log container to load everything
  await page.evaluate(async()=>{
    const scrollers=[...document.querySelectorAll('*')].filter(e=>e.scrollHeight>e.clientHeight+40)
    for(const s of scrollers){ for(let k=0;k<8;k++){ s.scrollTop=s.scrollHeight; await new Promise(r=>setTimeout(r,250)) } }
  })
  await page.waitForTimeout(2000)
  out.header = await page.evaluate(()=>document.body.innerText.replace(/\s+/g,' ').slice(0,300))
  out.entries = await page.evaluate(()=>{
    // find the log list: leaf nodes with a time pattern, take their row containers
    const rows=[...document.querySelectorAll('li,[role=listitem],div')].filter(e=>{
      const t=(e.innerText||'')
      return /\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM)?/.test(t) && t.length<220 && e.children.length<=6
    })
    const seen=new Set(); const outr=[]
    for(const r of rows){ const t=r.innerText.replace(/\s+/g,' ').trim()
      if(t && !seen.has(t)){ seen.add(t); outr.push(t) } }
    return outr.slice(0,60)
  })
  out.filters = await page.evaluate(()=>[...document.querySelectorAll('button,[role=tab]')].filter(b=>b.getBoundingClientRect().width>0)
    .map(b=>(b.innerText||'').trim()).filter(t=>/^(All|People|Meeting|Media)\b/i.test(t)))
  return out
}
