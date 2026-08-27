export default async ({page}) => page.evaluate(async ()=>{
  const ch='C4OXCK0OB50583Z', bob='U4QCBOB00000001';
  const out={};
  const r=await fetch(`/api/v1/channels/${ch}/members`,{credentials:'include'});
  const j=await r.json(); const a=(j&&(j.members||j))||[];
  out.memberRecord=(Array.isArray(a)?a:[]).map(m=>JSON.stringify(m).slice(0,180));
  const r2=await fetch(`/api/v1/users/${bob}/roles?company_id=O4QCF1XTURESO01`,{credentials:'include'});
  let b2=null; try{b2=await r2.json()}catch{}
  out.bobRoles={status:r2.status, body:JSON.stringify(b2).slice(0,240)};
  return out;
});
