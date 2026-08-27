export default async ({ ctx }) => {
  let closed = 0, kept = [];
  for (const p of ctx.pages()) {
    const u = p.url();
    if (u.includes('/guest/meeting/')) { try { await p.close(); closed++; } catch {} }
    else kept.push(u.slice(-40));
  }
  return { closed, remaining: ctx.pages().length, kept };
};
