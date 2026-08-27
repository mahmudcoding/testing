export default async ({ ctx }) => {
  const pages = ctx.pages();
  let closed = 0;
  for (let i = 1; i < pages.length; i++) { try { await pages[i].close(); closed++; } catch {} }
  return { closed, remaining: ctx.pages().length };
};
