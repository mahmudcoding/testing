// Walk the company audit log with the API's own cursor to exhaustion and report
// exactly how many distinct entries it can reach.
export default async ({page}) => {
  const CO='O4QDF1XTURESO01';
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/admin/audit-log',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(async ({CO,LIMIT})=>{
    const g=async q=>await (await fetch(`/api/v1/companies/${CO}/admin/audit-log?${q}`,{credentials:'include'})).json();
    const seen=new Set(); let before=null,beforeId=null,pages=0,rows=0;
    const seconds=new Set();
    while(pages<80){
      let q=`limit=${LIMIT}`;
      if(before) q+=`&before=${encodeURIComponent(before)}&before_id=${encodeURIComponent(beforeId)}`;
      const j=await g(q); const e=j.entries||[];
      e.forEach(x=>{seen.add(x.id); seconds.add(x.created_at);}); rows+=e.length; pages++;
      if(!j.next_before||!e.length) break;
      before=j.next_before; beforeId=j.next_before_id;
    }
    return {limit:LIMIT, pages, rowsReturned:rows, distinctReached:seen.size, distinctSecondsSeen:seconds.size};
  }, {CO, LIMIT: Number(process.env.QA_LIMIT||5)});
};
