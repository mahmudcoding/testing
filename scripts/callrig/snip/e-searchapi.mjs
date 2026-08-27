export default async ({page}) => {
  return await page.evaluate(async()=>{
    const out={};
    for (const q of ['alice','qa','general','qa-general','bob']) {
      const r=await fetch(`/api/v1/search?q=${encodeURIComponent(q)}&company_id=O4QEF1XTURESO01&workspace_id=W4QEF1XTURESO01`,{credentials:'include'});
      let j=null; try{j=await r.json();}catch(e){}
      out[q]={status:r.status, keys:j?Object.keys(j).join(','):null,
        counts: j? Object.fromEntries(Object.entries(j).map(([k,v])=>[k, Array.isArray(v)?v.length:(v&&typeof v==='object'?JSON.stringify(v).slice(0,60):v)])) : null};
    }
    return out;
  });
};
