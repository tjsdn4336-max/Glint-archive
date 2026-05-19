import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useSpecies } from '../hooks/useSpecies';
import GlintLogo from '../components/GlintLogo';
import type { User } from '@supabase/supabase-js';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LizardRow {
  id: string;
  user_id: string;
  name: string;
  species_id: string | null;
  morph_name: string | null;
  hatch_date: string | null;
  photo_url: string | null;
  notes: string | null;
  created_at: string;
}

interface WeightRecord {
  id: string;
  lizard_id: string;
  weight_g: number;
  recorded_at: string;
  note: string | null;
}

// ─── Auth Gate ────────────────────────────────────────────────────────────────

function AuthGate({ onAuth }: { onAuth: (user: User) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (mode === 'signup') {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setSuccess('확인 이메일을 발송했습니다. 이메일을 확인해 주세요.');
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        if (data.user) onAuth(data.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-surface-950 pt-16 flex items-center justify-center px-6">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <GlintLogo size={52} showText={false} className="text-gold-400 justify-center" />
          </div>
          <h1 className="font-display text-2xl font-bold text-zinc-100 mb-1">마이페이지</h1>
          <p className="text-sm text-zinc-500">로그인하여 사육 일지를 관리하세요</p>
        </div>

        <div className="rounded-2xl border border-surface-600 bg-surface-800 p-6">
          {/* Mode toggle */}
          <div className="flex rounded-xl overflow-hidden border border-surface-600 mb-6">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setSuccess(null); }}
                className={`flex-1 py-2.5 text-xs font-semibold tracking-wide transition-colors ${
                  mode === m
                    ? 'bg-gold-400 text-surface-950'
                    : 'bg-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {m === 'login' ? '로그인' : '회원가입'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] tracking-widest text-zinc-500 mb-1.5 uppercase">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl bg-surface-700 border border-surface-600 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-gold-400/60 transition-colors"
                placeholder="example@email.com"
              />
            </div>
            <div>
              <label className="block text-[11px] tracking-widest text-zinc-500 mb-1.5 uppercase">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl bg-surface-700 border border-surface-600 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-gold-400/60 transition-colors"
                placeholder="6자 이상"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
            )}
            {success && (
              <p className="text-xs text-emerald-400 bg-emerald-400/10 rounded-lg px-3 py-2">{success}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gold-400 py-3 text-sm font-bold text-surface-950 hover:bg-gold-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}

// ─── Lizard Passport Card ─────────────────────────────────────────────────────

function PassportCard({
  lizard,
  speciesName,
  onWeightClick,
  onDelete,
}: {
  lizard: LizardRow;
  speciesName: string;
  onWeightClick: () => void;
  onDelete: () => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const age = lizard.hatch_date
    ? Math.floor(
        (Date.now() - new Date(lizard.hatch_date).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      )
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-2xl border border-surface-600 bg-surface-800 overflow-hidden"
    >
      {/* Passport header stripe */}
      <div className="h-1.5 bg-gradient-to-r from-gold-400/60 via-gold-400 to-gold-400/60" />

      <div className="p-5">
        <div className="flex gap-4">
          {/* Photo */}
          <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-surface-700 border border-surface-600">
            {lizard.photo_url && !imgErr ? (
              <img
                src={lizard.photo_url}
                alt={lizard.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setImgErr(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <GlintLogo size={32} showText={false} className="text-zinc-600 justify-center" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] tracking-[0.3em] text-gold-400 mb-0.5 uppercase">LIZARD PASSPORT</p>
                <h3 className="font-display text-lg font-bold text-zinc-100 leading-tight">
                  {lizard.name}
                </h3>
              </div>
              <button
                onClick={onDelete}
                className="text-zinc-600 hover:text-red-400 transition-colors text-lg leading-none mt-0.5 flex-shrink-0"
                title="삭제"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-1">{speciesName}</p>
            {lizard.morph_name && (
              <span className="inline-block mt-1.5 rounded-sm bg-gold-400/10 border border-gold-400/20 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-gold-400 uppercase">
                {lizard.morph_name}
              </span>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-surface-600">
          <div>
            <p className="text-[9px] tracking-widest text-zinc-600 uppercase mb-1">부화일</p>
            <p className="text-xs font-semibold text-zinc-300">
              {lizard.hatch_date
                ? new Date(lizard.hatch_date).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-[9px] tracking-widest text-zinc-600 uppercase mb-1">나이</p>
            <p className="text-xs font-semibold text-zinc-300">
              {age !== null ? `${age}년` : '—'}
            </p>
          </div>
          <div>
            <p className="text-[9px] tracking-widest text-zinc-600 uppercase mb-1">메모</p>
            <p className="text-xs text-zinc-400 truncate">{lizard.notes || '—'}</p>
          </div>
        </div>

        {/* Weight button */}
        <button
          onClick={onWeightClick}
          className="mt-4 w-full rounded-xl border border-surface-600 bg-surface-700 hover:border-gold-400/40 hover:bg-surface-600 transition-all py-2.5 text-xs font-semibold text-zinc-400 hover:text-gold-400"
        >
          체중 기록 보기 / 추가 →
        </button>
      </div>
    </motion.div>
  );
}

// ─── Weight Modal ─────────────────────────────────────────────────────────────

function WeightModal({
  lizard,
  onClose,
}: {
  lizard: LizardRow;
  onClose: () => void;
}) {
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [weightInput, setWeightInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, [lizard.id]);

  async function fetchRecords() {
    setLoading(true);
    const { data } = await supabase
      .from('weight_records')
      .select('*')
      .eq('lizard_id', lizard.id)
      .order('recorded_at', { ascending: false });
    setRecords(data ?? []);
    setLoading(false);
  }

  async function addWeight(e: React.FormEvent) {
    e.preventDefault();
    const w = parseFloat(weightInput);
    if (isNaN(w) || w <= 0) return;
    setAdding(true);
    await supabase.from('weight_records').insert({
      lizard_id: lizard.id,
      weight_g: w,
      note: noteInput || null,
    });
    setWeightInput('');
    setNoteInput('');
    await fetchRecords();
    setAdding(false);
  }

  async function deleteRecord(id: string) {
    await supabase.from('weight_records').delete().eq('id', id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-surface-950/80 backdrop-blur-sm" />
      <motion.div
        className="relative w-full max-w-md bg-surface-800 border border-surface-600 rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 bg-gradient-to-r from-gold-400/40 via-gold-400 to-gold-400/40" />
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] tracking-widest text-gold-400 uppercase">체중 기록</p>
              <h3 className="font-display text-lg font-bold text-zinc-100">{lizard.name}</h3>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 text-xl">×</button>
          </div>

          {/* Add form */}
          <form onSubmit={addWeight} className="flex gap-2 mb-5">
            <input
              type="number"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="체중 (g)"
              step="0.1"
              min="0.1"
              required
              className="flex-1 rounded-xl bg-surface-700 border border-surface-600 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-gold-400/60 transition-colors"
            />
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="메모"
              className="flex-1 rounded-xl bg-surface-700 border border-surface-600 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-gold-400/60 transition-colors"
            />
            <button
              type="submit"
              disabled={adding}
              className="rounded-xl bg-gold-400 px-4 py-2.5 text-xs font-bold text-surface-950 hover:bg-gold-300 transition-colors disabled:opacity-50"
            >
              {adding ? '...' : '추가'}
            </button>
          </form>

          {/* Records list */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {loading ? (
              <p className="text-xs text-zinc-600 text-center py-6">불러오는 중...</p>
            ) : records.length === 0 ? (
              <p className="text-xs text-zinc-600 text-center py-6">기록이 없습니다. 첫 번째 체중을 입력해보세요!</p>
            ) : (
              records.map((r, i) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-xl bg-surface-700 px-4 py-3 group"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold ${i === 0 ? 'text-gold-400' : 'text-zinc-600'}`}>
                      {i === 0 ? '최신' : `#${records.length - i}`}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">
                        {r.weight_g}g
                      </p>
                      {r.note && <p className="text-[11px] text-zinc-500">{r.note}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-zinc-600">
                      {new Date(r.recorded_at).toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <button
                      onClick={() => deleteRecord(r.id)}
                      className="text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-base"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Register Form ────────────────────────────────────────────────────────────

function RegisterForm({
  userId,
  onSuccess,
}: {
  userId: string;
  onSuccess: () => void;
}) {
  const { data: species } = useSpecies();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    species_id: '',
    morph_name: '',
    hatch_date: '',
    photo_url: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const { error: err } = await supabase.from('user_lizards').insert({
        user_id: userId,
        name: form.name.trim(),
        species_id: form.species_id || null,
        morph_name: form.morph_name || null,
        hatch_date: form.hatch_date || null,
        photo_url: form.photo_url || null,
        notes: form.notes || null,
      });
      if (err) throw err;
      setForm({ name: '', species_id: '', morph_name: '', hatch_date: '', photo_url: '', notes: '' });
      setOpen(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 실패');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full bg-gold-400 px-5 py-2.5 text-xs font-bold text-surface-950 hover:bg-gold-300 transition-colors"
      >
        {open ? '닫기' : '+ 파충류 등록'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 overflow-hidden"
          >
            <div className="rounded-2xl border border-surface-600 bg-surface-800 p-6 space-y-4">
              <p className="text-[11px] tracking-[0.3em] text-gold-400 uppercase">파충류 등록</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] tracking-widest text-zinc-600 uppercase mb-1.5">
                    이름 *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="예: 달빛이"
                    className="w-full rounded-xl bg-surface-700 border border-surface-600 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-gold-400/60 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest text-zinc-600 uppercase mb-1.5">
                    종(Species)
                  </label>
                  <select
                    name="species_id"
                    value={form.species_id}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-surface-700 border border-surface-600 px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-gold-400/60 transition-colors"
                  >
                    <option value="">선택 안 함</option>
                    {species.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.name_ko}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest text-zinc-600 uppercase mb-1.5">
                    모프
                  </label>
                  <input
                    name="morph_name"
                    value={form.morph_name}
                    onChange={handleChange}
                    placeholder="예: Blizzard"
                    className="w-full rounded-xl bg-surface-700 border border-surface-600 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-gold-400/60 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracking-widest text-zinc-600 uppercase mb-1.5">
                    부화일
                  </label>
                  <input
                    type="date"
                    name="hatch_date"
                    value={form.hatch_date}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-surface-700 border border-surface-600 px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-gold-400/60 transition-colors"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] tracking-widest text-zinc-600 uppercase mb-1.5">
                    사진 URL (선택)
                  </label>
                  <input
                    name="photo_url"
                    value={form.photo_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full rounded-xl bg-surface-700 border border-surface-600 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-gold-400/60 transition-colors"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] tracking-widest text-zinc-600 uppercase mb-1.5">
                    메모
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={2}
                    placeholder="특이사항, 성격, 주의사항 등"
                    className="w-full rounded-xl bg-surface-700 border border-surface-600 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-gold-400/60 transition-colors resize-none"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-gold-400 px-6 py-3 text-xs font-bold text-surface-950 hover:bg-gold-300 transition-colors disabled:opacity-50"
              >
                {saving ? '저장 중...' : '여권 발급하기'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main MyPage ──────────────────────────────────────────────────────────────

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [lizards, setLizards] = useState<LizardRow[]>([]);
  const [lizardLoading, setLizardLoading] = useState(false);
  const [selectedLizard, setSelectedLizard] = useState<LizardRow | null>(null);
  const { data: species } = useSpecies();

  // Check auth state on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setAuthChecked(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Load lizards when user is set
  useEffect(() => {
    if (user) fetchLizards();
  }, [user]);

  async function fetchLizards() {
    if (!user) return;
    setLizardLoading(true);
    const { data } = await supabase
      .from('user_lizards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setLizards(data ?? []);
    setLizardLoading(false);
  }

  async function deleteLizard(id: string) {
    await supabase.from('user_lizards').delete().eq('id', id);
    setLizards((prev) => prev.filter((l) => l.id !== id));
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  function getSpeciesName(speciesId: string | null) {
    if (!speciesId) return '미지정 종';
    return species.find((s) => s.id === speciesId)?.name_ko ?? speciesId;
  }

  // Loading auth check
  if (!authChecked) {
    return (
      <main className="min-h-screen bg-surface-950 pt-16 flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-gold-400 border-t-transparent" />
      </main>
    );
  }

  // Not logged in → show auth gate
  if (!user) {
    return <AuthGate onAuth={(u) => setUser(u)} />;
  }

  return (
    <main className="min-h-screen bg-surface-950 pt-16">
      {/* Weight modal */}
      <AnimatePresence>
        {selectedLizard && (
          <WeightModal
            lizard={selectedLizard}
            onClose={() => setSelectedLizard(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-surface-700 bg-surface-900 px-6 py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(200,169,110,0.06),transparent)]" />
        <div className="mx-auto max-w-4xl relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-end justify-between"
          >
            <div>
              <p className="text-[11px] tracking-[0.4em] text-gold-400 mb-3 uppercase">My Care Diary</p>
              <div className="flex items-end gap-4 mb-2">
                <GlintLogo size={48} showText={false} className="text-gold-400" />
                <h1 className="font-display text-4xl font-bold text-zinc-100 leading-none">마이페이지</h1>
              </div>
              <p className="mt-3 text-sm text-zinc-500">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors border border-surface-600 rounded-full px-4 py-2"
            >
              로그아웃
            </button>
          </motion.div>

          <motion.div
            className="flex gap-8 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <div>
              <p className="text-2xl font-bold text-zinc-100 font-display">{lizards.length}</p>
              <p className="text-[10px] tracking-widest text-zinc-600 mt-0.5 uppercase">등록된 파충류</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-4xl">

          {/* Register form */}
          <div className="mb-10">
            <RegisterForm userId={user.id} onSuccess={fetchLizards} />
          </div>

          {/* Lizard passport grid */}
          {lizardLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-gold-400 border-t-transparent" />
            </div>
          ) : lizards.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center py-24 text-zinc-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <GlintLogo size={56} showText={false} className="text-zinc-700 justify-center mb-5" />
              <p className="text-sm mb-1">아직 등록된 파충류가 없습니다.</p>
              <p className="text-xs text-zinc-700">'+ 파충류 등록'으로 첫 번째 여권을 발급해보세요!</p>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            >
              <AnimatePresence>
                {lizards.map((l) => (
                  <PassportCard
                    key={l.id}
                    lizard={l}
                    speciesName={getSpeciesName(l.species_id)}
                    onWeightClick={() => setSelectedLizard(l)}
                    onDelete={() => deleteLizard(l.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}
