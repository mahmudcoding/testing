export default async ({page, ctx}) => {
  await ctx.grantPermissions(['clipboard-read','clipboard-write'], {origin:'https://airion-cargo.store'}).catch(()=>{});
  const txt = await page.evaluate(async()=>{ try { return await navigator.clipboard.readText(); } catch(e){ return 'ERR '+String(e).slice(0,80); } });
  return {clipboard: txt};
};
