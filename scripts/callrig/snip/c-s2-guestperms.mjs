export default async ({page}) => page.evaluate(async ()=>{
  const out={};
  const me=await fetch('/api/v1/auth/me',{credentials:'include'});
  const mj=await me.json();
  out.me={who:mj.email||mj.username, keys:Object.keys(mj).slice(0,12)};
  const co='O4QCF1XTURESO01';
  const r=await fetch(`/api/v1/users/me/roles?company_id=${co}`,{credentials:'include'});
  let j=null; try{j=await r.json()}catch{}
  const roles=(j&&(j.roles||j.items))||[];
  out.roles={status:r.status, list:(Array.isArray(roles)?roles:[]).map(x=>
    `${x.name} system=${x.is_system} guest=${x.is_guest} perms=${JSON.stringify(x.permissions||[]).slice(0,70)}`)};
  // archive the channel the guest made
  const a=await fetch('/api/v1/channels/C4OXIS5XBM5KZMO/archive',{method:'POST',credentials:'include'});
  out.cleanupArchive=a.status;
  return out;
});
