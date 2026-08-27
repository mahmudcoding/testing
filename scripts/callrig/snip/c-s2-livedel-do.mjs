export default async ({page}) => page.evaluate(async ()=>{
  const r=await fetch('/api/v1/channels/C4OXI650XQP3PQO',{method:'DELETE',credentials:'include'});
  let j=null; try{j=await r.json()}catch{}
  return {status:r.status, key:j&&j.key};
});
