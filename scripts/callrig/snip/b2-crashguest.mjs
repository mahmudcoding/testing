export default async ({ ctx }) => {
  const p = ctx.pages().find(x => x.url().includes('/guest/meeting/'));
  if (!p) return { error: 'no guest page' };
  const url = p.url().slice(-30);
  let sent = false;
  try {
    const cdp = await ctx.newCDPSession(p);
    cdp.send('Page.crash').catch(() => {});   // fire and forget — awaiting hangs
    sent = true;
  } catch (e) { return { error: String(e).slice(0, 60) }; }
  return { crashSentTo: url, sent };
};
