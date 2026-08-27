export default async ({page, ctx}) => {
  const pages = ctx.pages().filter(p=>!p.url().startsWith('devtools://'));
  const keep = pages[0];
  const closed=[];
  for (const p of pages.slice(1)) { closed.push(p.url().slice(0,60)); await p.close().catch(()=>{}); }
  return {kept: keep.url().slice(0,70), closed};
};
