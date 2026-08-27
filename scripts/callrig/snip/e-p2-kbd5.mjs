export default async ({page}) => {
  const ctx=page.context(); const ps=ctx.pages();
  let closed=0;
  for (const p of ps.slice(1)) { try{ await p.close(); closed++; }catch{} }
  return {tabsNow: ctx.pages().length, closed};
};
