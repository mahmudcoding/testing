const WS='W4QCF1XTURESO01', PRIV='C4QCPRIVATE0001';
const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/be46af86-e91b-43a7-99c1-153a85741b82/scratchpad/files';
export default async ({page}) => {
  await page.goto('about:blank'); await page.waitForTimeout(600);
  await page.goto(`https://airion-cargo.store/w/${WS}/c/${PRIV}`,{waitUntil:'load'});
  await page.waitForTimeout(7000);
  const reqs=[];
  page.on('request', r=>{
    const u=r.url();
    if(!/\/api\/v1\//.test(u) || r.method()==='GET') return;
    let post=''; try{ post=(r.postData()||''); }catch(e){ post='(binary)'; }
    const dm = (post.match(/name="display_mode"[\s\S]{0,60}/)||[null])[0];
    reqs.push({m:r.method(), u:u.split('/api/v1')[1].slice(0,40),
      display_mode: dm? dm.replace(/[\r\n]+/g,' ').slice(0,60):null,
      len: post.length, head: /files/.test(u)? '(multipart)' : post.slice(0,150)});
  });
  const out={};
  await page.locator('input[type=file]').first().setInputFiles(`${DIR}/qa-s2-pic.png`);
  await page.waitForTimeout(6000);
  out.afterAttach = reqs.slice(); reqs.length=0;
  await page.locator('button[aria-label="Send as file"]').first().click({timeout:8000});
  await page.waitForTimeout(2500);
  out.afterToggle = reqs.slice(); reqs.length=0;
  await page.locator('button[aria-label="Send"]').last().click({timeout:8000});
  await page.waitForTimeout(6000);
  out.afterSend = reqs.slice();
  out.rendered = await page.evaluate(()=>{
    const el=[...document.querySelectorAll('[data-message-id]')].pop();
    return {imgs:el.querySelectorAll('img').length, text:el.innerText.replace(/\n+/g,' | ').slice(0,60)};
  });
  return out;
};
