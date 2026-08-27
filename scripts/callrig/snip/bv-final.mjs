export default async ({page}) => {
  return await page.evaluate(async()=>{
    const r=await fetch('/api/v1/workspace/W4QBF1XTURESO01/meetings/active',{credentials:'include'})
    const t=await r.text()
    return {status:r.status, body:t.slice(0,300)}
  })
}
