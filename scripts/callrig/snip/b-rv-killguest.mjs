export default async ({ctx}) => {
  const pages = ctx.pages().filter(p=>p.url().includes('airion-cargo.store'));
  const g = pages.find(p=>/\/guest\/meeting\//.test(p.url()));
  if(!g) return {err:'no guest page'};
  const s = await ctx.newCDPSession(g);
  const ti = await s.send('Target.getTargetInfo');
  const id = ti.targetInfo.targetId;
  const port = process.env.QA_PORT || '9238';
  const r = await fetch(`http://127.0.0.1:${port}/json/close/${id}`).then(x=>x.text()).catch(e=>'ERR '+e.message);
  return {targetId:id, closed:r, at:new Date().toISOString()};
};
