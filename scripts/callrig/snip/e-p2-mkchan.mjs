import {WS} from './e-p2-helpers.mjs';
export default async ({page}) => await page.evaluate(async ({WS}) => {
  const r=await fetch('/api/v1/channels',{method:'POST',credentials:'include',
    headers:{'content-type':'application/json'},
    body:JSON.stringify({workspace_id:WS, name:'e-dirprobe', type:'public',
      description:'realtime probe for Directories - safe to delete'})});
  return {status:r.status, resp:(await r.text()).slice(0,150)};
}, {WS});
