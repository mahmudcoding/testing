export default async ({page}) => page.evaluate(async (cid) => {
  const r = await fetch('/api/v1/workspaces/W4QAF1XTURESO01/channels?limit=100',{credentials:'include'});
  const t = await r.text();
  return {status:r.status, hasChannel: t.includes(cid), len:t.length,
          dmCount:(t.match(/"type":"dm"/g)||[]).length};
}, process.env.QA_CID);
