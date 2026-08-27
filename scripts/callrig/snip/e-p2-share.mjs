const GEN='C4QEGENERAL0001', FID='F4OXKZJW9QAOUR6';
export default async ({page}) => await page.evaluate(async ({GEN,FID}) => {
  const tries=[
    ['POST', `/api/v1/files/${FID}/shares`, {channel_ids:[GEN]}],
    ['POST', `/api/v1/files/${FID}/share`,  {channel_ids:[GEN]}],
    ['POST', `/api/v1/files/${FID}/shares`, {channel_id:GEN}],
  ];
  const out=[];
  for (const [m,u,b] of tries){
    const r=await fetch(u,{method:m,credentials:'include',headers:{'content-type':'application/json'},body:JSON.stringify(b)});
    const t=await r.text();
    out.push({u:u.replace(FID,'<fid>'), body:JSON.stringify(b).slice(0,40), status:r.status, resp:t.slice(0,120)});
    if (r.status<300) break;
  }
  return out;
}, {GEN,FID});
