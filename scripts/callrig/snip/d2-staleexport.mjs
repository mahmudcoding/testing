import { watchNotices } from './lib.mjs';
export default async ({page}) => {
  const out={url: page.url()};
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(u.pathname.startsWith('/api/v1/')) reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  let dl=null; const grab=d=>{dl={name:d.suggestedFilename()}; d.cancel().catch(()=>{});};
  page.on('download', grab);
  out.notices = await watchNotices(page,{ms:10000, trigger: async()=>{
    const b=page.locator('main button').filter({hasText:/^Export CSV$/}).first();
    out.found = await b.count();
    if(out.found) await b.click();
  }});
  page.off('response', on); page.off('download', grab);
  out.reqs=reqs; out.download=dl;
  return out;
};
