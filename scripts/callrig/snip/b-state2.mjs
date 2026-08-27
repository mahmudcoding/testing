export default async ({page}) => {
  const ws='W4QBF1XTURESO01';
  const r = await page.evaluate(async (ws) => {
    const g = async u => { try { const r = await fetch(u,{credentials:'include'}); const j = await r.json(); return {s:r.status, j}; } catch(e){ return {err:String(e)}; } };
    const ch = await g(`/api/v1/messaging/channels/C4QBGENERAL0001/messages?limit=15`);
    const msgs = (ch.j?.data?.messages || ch.j?.messages || []).map(m=>({
      id:m.id, u:(m.user_id||m.sender_id||'').slice(-6), b:(m.body||'').slice(0,60),
      edited: m.edited_at||m.is_edited||null, del: m.deleted_at||m.is_deleted||null,
      thread: m.thread_count ?? m.reply_count ?? null, reacts:(m.reactions||[]).length
    }));
    return {status: ch.s, n: msgs.length, msgs};
  }, ws);
  return r;
};
