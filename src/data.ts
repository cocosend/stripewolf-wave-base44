import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key, { auth: { storageKey: 'stripewolf.auth', persistSession: true, autoRefreshToken: true } }) : null;
type Fields = Record<string, unknown>;
type Row = Fields & { id: string; created_by_id: string; created_date: string };
type Options = { sort?: string; limit?: number };
const guest = { id: 'local', email: '', full_name: '' };
async function me() {
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  return session ? { id: session.user.id, email: session.user.email ?? '', full_name: '' } : guest;
}
const kinds = ['AutomixSettings','PerformanceSession','DjProfile','HardwareMapping','AudioRoutingSettings'] as const;
function readLocal(kind: string): Row[] {
  const raw = localStorage.getItem(`stripewolf.v1.${kind}`);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error('Повреждены локальные настройки. Экспортируйте данные перед очисткой браузера.');
  return parsed as Row[];
}
function writeLocal(kind: string, rows: Row[]) { localStorage.setItem(`stripewolf.v1.${kind}`, JSON.stringify(rows)); }
function matches(row: Row, query: Fields) { return Object.entries(query).every(([k,v]) => row[k] === v); }
function entity(kind: string) {
  async function filter(query: Fields = {}, options: Options = {}) {
    const user = await me();
    let rows: Row[];
    if (user.id === 'local' || !supabase) rows = readLocal(kind);
    else {
      const {data, error} = await supabase.from('stripewolf_records').select('id,owner_id,created_at,data').eq('owner_id',user.id).eq('kind',kind).order('created_at',{ascending:false}).limit(1000);
      if (error) throw error;
      rows = (data ?? []).map(r => ({...r.data, id:r.id, created_by_id:r.owner_id, created_date:r.created_at}));
    }
    rows = rows.filter(r => matches(r,query));
    if (options.sort) {
      const desc = options.sort.startsWith('-'); const field = options.sort.replace(/^-/, '');
      rows.sort((a,b) => String(a[field] ?? '').localeCompare(String(b[field] ?? '')) * (desc ? -1 : 1));
    }
    return {items:rows.slice(0,options.limit ?? 1000)};
  }
  async function create(data: Fields) {
    const user = await me();
    const row: Row = {...data,id:crypto.randomUUID(),created_by_id:user.id,created_date:new Date().toISOString()};
    if(user.id === 'local' || !supabase) writeLocal(kind,[row,...readLocal(kind)]);
    else {
      const {error} = await supabase.from('stripewolf_records').insert({id:row.id,owner_id:user.id,kind,data});
      if(error) throw error;
    }
    return row;
  }
  async function update(id: string, patch: Fields) {
    const user = await me();
    const rows = (await filter({id})).items;
    if(!rows[0]) throw new Error('Запись не найдена или недоступна этому аккаунту.');
    const row = {...rows[0],...patch,id,created_by_id:user.id};
    if(user.id==='local' || !supabase) writeLocal(kind,readLocal(kind).map(r=>r.id===id?row:r));
    else {
      const {id:_id,created_by_id:_owner,created_date:_date,...data} = row;
      const {data:changed,error}=await supabase.from('stripewolf_records').update({data}).eq('id',id).eq('owner_id',user.id).eq('kind',kind).select('id');
      if(error) throw error;
      if(!changed?.length) throw new Error('Запись не сохранена. Проверьте авторизацию.');
    }
    return row;
  }
  return {filter,create,update,
    async delete(id: string) {
      const user=await me();
      if(user.id==='local'||!supabase) writeLocal(kind,readLocal(kind).filter(r=>r.id!==id));
      else { const {error}=await supabase.from('stripewolf_records').delete().eq('id',id).eq('owner_id',user.id).eq('kind',kind); if(error)throw error; }
    },
    async updateMany(query: Fields, change: {$set:Fields}) { const {items}=await filter(query); for(const row of items) await update(row.id,change.$set); },
    async aggregate({query={},sum=[],avg=[]}:{query?:Fields;sum?:string[];avg?:string[]}) {
      const {items}=await filter(query); const result:Fields={count:items.length};
      for(const field of sum) result[`sum_${field}`]=items.reduce((n,r)=>n+Number(r[field]??0),0);
      for(const field of avg) result[`avg_${field}`]=items.length?items.reduce((n,r)=>n+Number(r[field]??0),0)/items.length:0;
      return {rows:[result]};
    }
  };
}
export const dataApi={auth:{me},entities:Object.fromEntries(kinds.map(k=>[k,entity(k)]))};
