const WS = 'W4QAF1XTURESO01'
export default async ({ page }) => {
  const url = page.url()
  const r = await page.evaluate(async (ws) => {
    const j = async (u) => {
      try {
        const res = await fetch(u, { credentials: 'include' })
        return { status: res.status, body: await res.json().catch(() => null) }
      } catch (e) { return { error: String(e) } }
    }
    const me = await j('/api/v1/auth/me')
    const cur = await j('/api/v1/meetings/current')
    const act = await j(`/api/v1/workspace/${ws}/meetings/active`)
    return { me: me.body?.email ?? me.body?.user?.email ?? me.status, cur, act }
  }, WS)
  return { url, ...r }
}
