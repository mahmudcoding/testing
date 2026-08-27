export default async ({page}) => {
  await page.goto('https://airion-cargo.store/', {waitUntil:'domcontentloaded'}).catch(()=>{})
  const me = await page.evaluate(async () => {
    try {
      const r = await fetch('/api/v1/auth/me', {credentials:'include'})
      if (!r.ok) return {status:r.status}
      const j = await r.json()
      return {status:r.status, email:j?.email ?? j?.data?.email, id:(j?.id ?? j?.data?.id)}
    } catch(e){ return {err:String(e).slice(0,80)} }
  })
  return {url: page.url().slice(0,90), visibility: await page.evaluate(()=>document.visibilityState), me}
}
