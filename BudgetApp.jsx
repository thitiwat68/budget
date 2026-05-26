import { useState, useCallback } from "react";

const COLORS = ['#1D9E75','#378ADD','#D85A30','#D4537E','#7F77DD','#BA7517'];

function fmt(n) {
  return Number(n).toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const initAccounts = [
  { id: 1, name: 'น้า', balance: 700000, color: COLORS[0] },
  { id: 2, name: 'แม่', balance: 300000, color: COLORS[1] },
];

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [accounts, setAccounts] = useState(initAccounts);
  const [transactions, setTransactions] = useState([]);
  const [nextAccId, setNextAccId] = useState(3);
  const [nextTxId, setNextTxId] = useState(1);
  const [txType, setTxType] = useState('income');
  const [txAccId, setTxAccId] = useState(1);
  const [txToAccId, setTxToAccId] = useState(2);
  const [txAmt, setTxAmt] = useState('');
  const [txCat, setTxCat] = useState('อาหาร');
  const [txNote, setTxNote] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [newName, setNewName] = useState('');
  const [newBal, setNewBal] = useState('');
  const [fAcc, setFAcc] = useState('');
  const [fType, setFType] = useState('');

  const total = accounts.reduce((s, a) => s + a.balance, 0);
  const totalInc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const addTx = () => {
    const amount = parseFloat(txAmt);
    if (!amount || amount <= 0) { alert('กรุณาระบุจำนวนเงิน'); return; }
    if (txType === 'transfer' && txAccId === txToAccId) { alert('บัญชีต้นทางและปลายทางต้องต่างกัน'); return; }
    const acc = accounts.find(a => a.id === txAccId);
    if (!acc) { alert('ไม่พบบัญชี'); return; }
    if ((txType === 'expense' || txType === 'transfer') && acc.balance < amount) { alert('ยอดเงินไม่พอ'); return; }
    setAccounts(prev => prev.map(a => {
      if (a.id === txAccId) {
        if (txType === 'income') return { ...a, balance: a.balance + amount };
        if (txType === 'expense') return { ...a, balance: a.balance - amount };
        if (txType === 'transfer') return { ...a, balance: a.balance - amount };
      }
      if (txType === 'transfer' && a.id === txToAccId) return { ...a, balance: a.balance + amount };
      return a;
    }));
    setTransactions(prev => [...prev, { id: nextTxId, type: txType, accountId: txAccId, toAccountId: txType === 'transfer' ? txToAccId : null, amount, category: txCat, note: txNote, date: txDate }]);
    setNextTxId(n => n + 1);
    setTxAmt(''); setTxNote('');
    alert('✓ บันทึกเรียบร้อย');
  };

  const delTx = (id) => {
    if (!confirm('ลบรายการนี้?')) return;
    const t = transactions.find(x => x.id === id);
    if (t) {
      setAccounts(prev => prev.map(a => {
        if (a.id === t.accountId) {
          if (t.type === 'income') return { ...a, balance: a.balance - t.amount };
          if (t.type === 'expense') return { ...a, balance: a.balance + t.amount };
          if (t.type === 'transfer') return { ...a, balance: a.balance + t.amount };
        }
        if (t.type === 'transfer' && a.id === t.toAccountId) return { ...a, balance: a.balance - t.amount };
        return a;
      }));
    }
    setTransactions(prev => prev.filter(x => x.id !== id));
  };

  const addAcc = () => {
    if (!newName.trim()) { alert('กรุณาระบุชื่อ'); return; }
    setAccounts(prev => [...prev, { id: nextAccId, name: newName.trim(), balance: parseFloat(newBal) || 0, color: COLORS[prev.length % COLORS.length] }]);
    setNextAccId(n => n + 1);
    setNewName(''); setNewBal('');
  };

  const delAcc = (id) => {
    if (!confirm('ลบบัญชีนี้?')) return;
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const resetAll = () => {
    if (!confirm('ล้างข้อมูลทั้งหมด?')) return;
    setAccounts([]); setTransactions([]); setNextAccId(1); setNextTxId(1);
    alert('✓ ล้างข้อมูลเรียบร้อย');
  };

  const filteredTx = [...transactions]
    .sort((a, b) => b.id - a.id)
    .filter(t => !fAcc || t.accountId === parseInt(fAcc) || t.toAccountId === parseInt(fAcc))
    .filter(t => !fType || t.type === fType);

  const TxRow = ({ t }) => {
    const acc = accounts.find(a => a.id === t.accountId);
    const toAcc = t.toAccountId ? accounts.find(a => a.id === t.toAccountId) : null;
    const color = acc?.color || '#888';
    const typeLabel = t.type === 'income' ? 'รายรับ' : t.type === 'expense' ? 'รายจ่าย' : 'โอน';
    const badgeColor = t.type === 'income' ? '#1D9E75' : t.type === 'expense' ? '#D85A30' : '#378ADD';
    const badgeBg = t.type === 'income' ? '#E1F5EE' : t.type === 'expense' ? '#FAECE7' : '#E6F1FB';
    const amtColor = t.type === 'income' ? '#1D9E75' : t.type === 'expense' ? '#D85A30' : '#378ADD';
    const prefix = t.type === 'income' ? '+' : t.type === 'expense' ? '-' : '';
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '0.5px solid #eee' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
            {acc?.name || '?'}{toAcc ? ` → ${toAcc.name}` : ''}
            <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 100, background: badgeBg, color: badgeColor, fontWeight: 500 }}>{typeLabel}</span>
          </div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{t.date} · {t.category}{t.note ? ` · ${t.note}` : ''}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: amtColor }}>{prefix}฿{fmt(t.amount)}</span>
          <button onClick={() => delTx(t.id)} style={{ background: 'none', border: '0.5px solid #ddd', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: '#D85A30', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      </div>
    );
  };

  const s = {
    card: { background: 'white', border: '0.5px solid #e8e6e0', borderRadius: 12, padding: 14, marginBottom: 10 },
    cardTitle: { fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
    label: { display: 'block', fontSize: 12, color: '#888', marginBottom: 5, fontWeight: 500 },
    input: { width: '100%', padding: '10px 12px', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 14, background: 'transparent', color: 'inherit', WebkitAppearance: 'none', appearance: 'none', marginBottom: 0 },
    btnSave: { width: '100%', padding: 12, background: '#1A1916', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' },
    btnReset: { width: '100%', padding: 12, background: '#FAECE7', color: '#D85A30', border: '0.5px solid #F0997B', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', marginTop: 8 },
  };

  const TypeBtn = ({ type, label }) => {
    const active = txType === type;
    const colors = { income: { bg: '#E1F5EE', border: '#1D9E75', text: '#1D9E75' }, expense: { bg: '#FAECE7', border: '#D85A30', text: '#D85A30' }, transfer: { bg: '#E6F1FB', border: '#378ADD', text: '#378ADD' } };
    return (
      <button onClick={() => setTxType(type)} style={{ padding: '9px 4px', borderRadius: 8, border: `1.5px solid ${active ? colors[type].border : '#ddd'}`, background: active ? colors[type].bg : 'transparent', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: active ? colors[type].text : '#888' }}>{label}</button>
    );
  };

  const tabs = [
    { id: 'dashboard', label: '📊 ภาพรวม' },
    { id: 'add', label: '➕ บันทึก' },
    { id: 'history', label: '📋 ประวัติ' },
    { id: 'accounts', label: '👤 บัญชี' },
  ];

  return (
    <div style={{ fontFamily: 'sans-serif', paddingBottom: 16 }}>
      <div style={{ display: 'flex', borderBottom: '0.5px solid #eee', marginBottom: 12, position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '10px 2px', fontSize: 12, border: 'none', background: 'none', cursor: 'pointer', borderBottom: tab === t.id ? '2px solid #1A1916' : '2px solid transparent', color: tab === t.id ? '#1A1916' : '#888', fontWeight: tab === t.id ? 500 : 400 }}>{t.label}</button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div style={{ padding: '0 12px' }}>
          <div style={{ background: '#1A1916', color: 'white', borderRadius: 12, padding: '18px 14px', marginBottom: 10 }}>
            <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>ยอดรวมทั้งหมด</div>
            <div style={{ fontSize: 28, fontWeight: 500, letterSpacing: -1 }}>฿{fmt(total)}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            <div style={{ background: '#f5f5f3', borderRadius: 8, padding: 10 }}><div style={{ fontSize: 11, color: '#888', marginBottom: 3 }}>รายรับรวม</div><div style={{ fontSize: 17, fontWeight: 500, color: '#1D9E75' }}>฿{fmt(totalInc)}</div></div>
            <div style={{ background: '#f5f5f3', borderRadius: 8, padding: 10 }}><div style={{ fontSize: 11, color: '#888', marginBottom: 3 }}>รายจ่ายรวม</div><div style={{ fontSize: 17, fontWeight: 500, color: '#D85A30' }}>฿{fmt(totalExp)}</div></div>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}>สัดส่วนบัญชีย่อย</div>
            {accounts.length === 0 ? <div style={{ textAlign: 'center', color: '#888', padding: '1rem 0', fontSize: 13 }}>ยังไม่มีบัญชีย่อย</div> :
              accounts.map(a => {
                const pct = total > 0 ? Math.round(a.balance / total * 100) : 0;
                return (
                  <div key={a.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, display: 'inline-block' }} />{a.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>฿{fmt(a.balance)} <span style={{ fontSize: 11, color: '#888', fontWeight: 400 }}>{pct}%</span></span>
                    </div>
                    <div style={{ background: '#f0f0ee', borderRadius: 100, height: 5, overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: a.color, borderRadius: 100 }} /></div>
                  </div>
                );
              })}
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}>รายการล่าสุด</div>
            {transactions.length === 0 ? <div style={{ textAlign: 'center', color: '#888', padding: '1rem 0', fontSize: 13 }}>ยังไม่มีรายการ</div> :
              [...transactions].sort((a, b) => b.id - a.id).slice(0, 5).map(t => <TxRow key={t.id} t={t} />)}
          </div>
        </div>
      )}

      {tab === 'add' && (
        <div style={{ padding: '0 12px' }}>
          <div style={s.card}>
            <div style={s.cardTitle}>ประเภท</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
              <TypeBtn type="income" label="รายรับ" />
              <TypeBtn type="expense" label="รายจ่าย" />
              <TypeBtn type="transfer" label="โอน" />
            </div>
            {[
              <div key="acc"><label style={s.label}>บัญชี</label><select value={txAccId} onChange={e => setTxAccId(parseInt(e.target.value))} style={s.input}>{accounts.map(a => <option key={a.id} value={a.id}>{a.name} (฿{fmt(a.balance)})</option>)}</select></div>,
              txType === 'transfer' && <div key="to"><label style={{ ...s.label, marginTop: 10 }}>โอนไปบัญชี</label><select value={txToAccId} onChange={e => setTxToAccId(parseInt(e.target.value))} style={s.input}>{accounts.map(a => <option key={a.id} value={a.id}>{a.name} (฿{fmt(a.balance)})</option>)}</select></div>,
              <div key="amt" style={{ marginTop: 10 }}><label style={s.label}>จำนวน (บาท)</label><input type="number" value={txAmt} onChange={e => setTxAmt(e.target.value)} placeholder="0" inputMode="decimal" style={s.input} /></div>,
              <div key="cat" style={{ marginTop: 10 }}><label style={s.label}>หมวดหมู่</label><select value={txCat} onChange={e => setTxCat(e.target.value)} style={s.input}>{['อาหาร','เดินทาง','สาธารณูปโภค','ช้อปปิ้ง','สุขภาพ','รายได้','ดอกเบี้ย','อื่น ๆ'].map(c => <option key={c}>{c}</option>)}</select></div>,
              <div key="note" style={{ marginTop: 10 }}><label style={s.label}>หมายเหตุ</label><input type="text" value={txNote} onChange={e => setTxNote(e.target.value)} placeholder="(ไม่บังคับ)" style={s.input} /></div>,
              <div key="date" style={{ marginTop: 10 }}><label style={s.label}>วันที่</label><input type="date" value={txDate} onChange={e => setTxDate(e.target.value)} style={s.input} /></div>,
            ]}
            <button onClick={addTx} style={{ ...s.btnSave, marginTop: 14 }}>บันทึก</button>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div style={{ padding: '0 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            <select value={fAcc} onChange={e => setFAcc(e.target.value)} style={{ ...s.input, padding: '8px 10px', fontSize: 13 }}><option value="">ทุกบัญชี</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
            <select value={fType} onChange={e => setFType(e.target.value)} style={{ ...s.input, padding: '8px 10px', fontSize: 13 }}><option value="">ทุกประเภท</option><option value="income">รายรับ</option><option value="expense">รายจ่าย</option><option value="transfer">โอน</option></select>
          </div>
          <div style={s.card}>{filteredTx.length ? filteredTx.map(t => <TxRow key={t.id} t={t} />) : <div style={{ textAlign: 'center', color: '#888', padding: '1rem 0', fontSize: 13 }}>ไม่มีรายการ</div>}</div>
        </div>
      )}

      {tab === 'accounts' && (
        <div style={{ padding: '0 12px' }}>
          <div style={s.card}>
            <div style={s.cardTitle}>เพิ่มบัญชีย่อย</div>
            <div><label style={s.label}>ชื่อเจ้าของ</label><input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="เช่น น้า" style={s.input} /></div>
            <div style={{ marginTop: 10 }}><label style={s.label}>ยอดเริ่มต้น (บาท)</label><input type="number" value={newBal} onChange={e => setNewBal(e.target.value)} placeholder="0" inputMode="decimal" style={s.input} /></div>
            <button onClick={addAcc} style={{ ...s.btnSave, marginTop: 12 }}>+ เพิ่มบัญชี</button>
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}>บัญชีทั้งหมด</div>
            {accounts.length === 0 ? <div style={{ textAlign: 'center', color: '#888', padding: '1rem 0', fontSize: 13 }}>ยังไม่มีบัญชี</div> :
              accounts.map(a => (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '0.5px solid #eee' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: a.color, display: 'inline-block', flexShrink: 0 }} />
                    <div><div style={{ fontSize: 14, fontWeight: 500 }}>{a.name}</div><div style={{ fontSize: 12, color: '#888' }}>฿{fmt(a.balance)}</div></div>
                  </div>
                  <button onClick={() => delAcc(a.id)} style={{ background: 'none', border: '0.5px solid #ddd', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: '#D85A30', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              ))}
          </div>
          <div style={s.card}>
            <div style={s.cardTitle}>ตั้งค่า</div>
            <button onClick={resetAll} style={s.btnReset}>🗑 ล้างข้อมูลทั้งหมด</button>
          </div>
        </div>
      )}
    </div>
  );
}
