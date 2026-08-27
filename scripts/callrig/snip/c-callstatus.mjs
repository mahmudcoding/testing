export default async ({page}) => {
  const id=process.env.QA_CALL; const rows=[]; const t0=Date.now();
  while (Date.now()-t0 < 90000) {
    const s = await page.evaluate(async (id)=>{
      const m=await (await fetch(`/api/v1/meeting/${id}`,{credentials:'include'})).text();
      const a=await (await fetch(`/api/v1/workspace/W4QCF1XTURESO01/meetings/active`,{credentials:'include'})).text();
      return {st:(m.match(/"status":"[a-z_]+"/)||[''])[0], ended:(m.match(/"ended_at":("[^"]*"|null)/)||[''])[0], activeHas: a.includes(id)};
    }, id);
    rows.push({s:Math.round((Date.now()-t0)/1000), ...s});
    await page.waitForTimeout(5000);
  }
  const cond=[]; let prev='';
  for(const r of rows){const k=JSON.stringify([r.st,r.ended,r.activeHas]); if(k!==prev){cond.push(r);prev=k;}}
  return {changes:cond, last:rows[rows.length-1]};
};
