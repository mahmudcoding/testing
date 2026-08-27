export default async ({page}) => {
  return page.evaluate(async ()=>{
    let dbs=[]; try{ dbs=(await indexedDB.databases()).map(d=>d.name); }catch(e){ dbs=['(unavailable)']; }
    let ls=0; try{ ls=Object.keys(localStorage).length; }catch(e){}
    return {indexedDB:dbs, localStorageKeys:ls};
  });
};
