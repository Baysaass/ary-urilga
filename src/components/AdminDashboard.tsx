import React, { useState } from 'react';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Settings,
  Calendar,
  Image,
  LogOut,
  Trash2,
  Eye,
  EyeOff,
  Edit2,
  Save,
  Download,
  Plus,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import {
  EventConfig,
  RSVP,
  Blessing,
  BlessingStatus,
  TimelineItem,
  GalleryPhoto,
  SymbolicGift,
} from '../types';
import {
  saveEventConfig,
  saveRsvps,
  updateBlessingStatus,
  updateBlessingContent,
  deleteBlessing,
  saveTimeline,
  saveGallery,
  resetAllToDefaults,
} from '../lib/storage';

interface AdminDashboardProps {
  config: EventConfig;
  rsvps: RSVP[];
  blessings: Blessing[];
  timeline: TimelineItem[];
  gallery: GalleryPhoto[];
  gifts: SymbolicGift[];
  onRefreshData: () => void;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  config,
  rsvps,
  blessings,
  timeline,
  gallery,
  gifts,
  onRefreshData,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rsvps' | 'blessings' | 'settings' | 'timeline' | 'gallery'>('overview');
  const [blessingFilter, setBlessingFilter] = useState<BlessingStatus | 'all'>('pending');
  const [dayFilter, setDayFilter] = useState<'all' | '10-23' | '10-24'>('all');
  const [editingConfig, setEditingConfig] = useState<EventConfig>({ ...config });
  const [editingBlessingId, setEditingBlessingId] = useState<string | null>(null);
  const [editBlessingMsg, setEditBlessingMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Overview Stats
  const attendingRsvps = rsvps.filter((r) => r.attending !== 'no');
  const totalGuests = attendingRsvps.reduce((acc, r) => acc + (r.guest_count || 1), 0);
  const totalAdults = attendingRsvps.reduce((acc, r) => acc + (r.adults !== undefined ? r.adults : (r.guest_count || 1)), 0);
  const totalChildren = attendingRsvps.reduce((acc, r) => acc + (r.children || 0), 0);
  const attendingDay1 = attendingRsvps.filter((r) => (r.event_day || '10-23') === '10-23');
  const totalDay1Guests = attendingDay1.reduce((acc, r) => acc + (r.guest_count || 1), 0);
  const attendingDay2 = attendingRsvps.filter((r) => r.event_day === '10-24');
  const totalDay2Guests = attendingDay2.reduce((acc, r) => acc + (r.guest_count || 1), 0);
  const notAttendingRsvps = rsvps.filter((r) => r.attending === 'no');
  const pendingBlessings = blessings.filter((b) => b.status === 'pending');
  const approvedBlessings = blessings.filter((b) => b.status === 'approved');
  const rejectedBlessings = blessings.filter((b) => b.status === 'rejected');
  const hiddenBlessings = blessings.filter((b) => b.status === 'hidden');
  const totalSymbolic = gifts.reduce((acc, g) => acc + g.count, 0);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const runHostAction = async (action: () => Promise<void>, message: string) => {
    try { await action(); onRefreshData(); showStatus(message); }
    catch (error) { showStatus(error instanceof Error ? error.message : 'Хадгалж чадсангүй.'); }
  };
  const handleApproveBlessing = (id: string) => void runHostAction(() => updateBlessingStatus(id, 'approved'), 'Ерөөл нийтлэгдлээ.');
  const handleRejectBlessing = (id: string) => void runHostAction(() => updateBlessingStatus(id, 'rejected'), 'Ерөөлийг татгалзлаа.');
  const handleHideBlessing = (id: string) => void runHostAction(() => updateBlessingStatus(id, 'hidden'), 'Ерөөлийг нуулаа.');
  const handleDeleteBlessing = (id: string) => {
    if (window.confirm('Энэ ерөөлийг бүрмөсөн устгах уу?')) void runHostAction(() => deleteBlessing(id), 'Ерөөл устгагдлаа.');
  };
  const handleSaveBlessingEdit = (id: string) => {
    if (!editBlessingMsg.trim()) return;
    void runHostAction(async () => {
      await updateBlessingContent(id, { message: editBlessingMsg.trim() });
      setEditingBlessingId(null);
    }, 'Ерөөлийн агуулга шинэчлэгдлээ.');
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveEventConfig(editingConfig);
    onRefreshData();
    showStatus('Эвент тохиргоо амжилттай хадгалагдлаа!');
  };

  const handleExportRsvpsCsv = () => {
    const headers = ['Нэр', 'Цайллагын өдөр', 'Ирэх эсэх', 'Нийт тоо', 'Том хүн', 'Хүүхэд', 'Тэмдэглэл/Утас', 'Огноо'];
    const rows = rsvps.map((r) => [
      `"${r.guest_name.replace(/"/g, '""')}"`,
      r.event_day === '10-24' ? '10 сарын 24 (Бямба)' : '10 сарын 23 (Баасан)',
      r.attending === 'no' ? 'Амжихгүй' : (r.attending === 'with_family' ? 'Гэр бүлээрээ' : 'Ирнэ'),
      r.guest_count,
      r.adults ?? (r.attending === 'no' ? 0 : r.guest_count),
      r.children ?? 0,
      `"${(r.phone_or_note || '').replace(/"/g, '""')}"`,
      new Date(r.created_at).toLocaleDateString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `housewarming_rsvp_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredBlessings = blessings.filter((b) => {
    if (blessingFilter !== 'all' && b.status !== blessingFilter) return false;
    if (searchTerm) {
      return (
        b.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-50 text-slate-800 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h1 className="text-lg font-bold text-slate-900">
                Гэрийн эзний удирдлагын хэсэг (Admin)
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Шинэ гэрийн цайллагын бүртгэл, ерөөл зохицуулалт ба тохиргоо
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm('Бүх ерөөл, бэлгэдлийн сонголтыг устгаж, тохиргоог анхны байдалд оруулах уу?')) {
                  void runHostAction(resetAllToDefaults, 'Өгөгдөл анхны байдалд орлоо.');
                }
              }}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Шинэчлэх</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Урилга руу буцах</span>
            </button>
          </div>
        </header>

        {/* Status Toast */}
        {statusMessage && (
          <div className="bg-emerald-600 text-white text-xs px-6 py-2 flex items-center justify-between">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-white font-bold ml-2">×</button>
          </div>
        )}

        {/* Tab Navigation */}
        <nav className="bg-white border-b border-slate-200 px-6 flex gap-4 text-xs font-medium text-slate-600 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <span>Тойм мэдээлэл</span>
          </button>

          <button
            onClick={() => setActiveTab('rsvps')}
            className={`py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'rsvps'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Ирэх зочид ({rsvps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('blessings')}
            className={`py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'blessings'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ерөөл батлах ({pendingBlessings.length} шинэ)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-indigo-600 text-indigo-600 font-semibold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Эвент тохиргоо</span>
          </button>
        </nav>

        {/* Content Area */}
        <main className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium block">
                    1 дэх өдөр: 10.23 (Баасан)
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-amber-700">
                      {totalDay1Guests}
                    </span>
                    <span className="text-xs text-amber-700 font-medium">зочин</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {attendingDay1.length} бүртгэл / бүлэг
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium block">
                    2 дахь өдөр: 10.24 (Бямба)
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-indigo-600">
                      {totalDay2Guests}
                    </span>
                    <span className="text-xs text-indigo-600 font-medium">зочин</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {attendingDay2.length} бүртгэл / бүлэг
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium block">
                    Хүлээгдэж буй ерөөл
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-amber-600">
                      {pendingBlessings.length}
                    </span>
                    <span className="text-xs text-slate-500">хүлээгдэж байна</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Батлагдсан: {approvedBlessings.length}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 font-medium block">
                    Нийт бэлгэдлийн бэлэг
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">
                      {totalSymbolic}
                    </span>
                    <span className="text-xs text-slate-500">илгээлт</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Хайр, аз хийморь гэх мэт
                  </span>
                </div>
              </div>

              {/* Action shortcuts & Pending Blessings preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 text-sm">
                      Батлах хүлээгдэж буй ерөөлүүд ({pendingBlessings.length})
                    </h3>
                    <button
                      onClick={() => {
                        setActiveTab('blessings');
                        setBlessingFilter('pending');
                      }}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Бүгдийг харах
                    </button>
                  </div>

                  {pendingBlessings.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Шинэ хүлээгдэж буй ерөөл одоогоор байхгүй байна.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingBlessings.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-lg bg-amber-50/60 border border-amber-200/80 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between font-medium text-slate-800">
                            <span>{item.guest_name}</span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-600 italic">“{item.message}”</p>
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              onClick={() => handleRejectBlessing(item.id)}
                              className="px-2.5 py-1 text-[11px] text-rose-600 hover:bg-rose-100 rounded cursor-pointer"
                            >
                              Татгалзах
                            </button>
                            <button
                              onClick={() => handleApproveBlessing(item.id)}
                              className="px-3 py-1 text-[11px] text-white bg-emerald-600 hover:bg-emerald-700 rounded font-medium cursor-pointer"
                            >
                              Батлах (Нийтлэх)
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Event info snapshot */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-semibold text-slate-900 text-sm mb-3">
                    Эвент мэдээлэл
                  </h3>
                  <div className="text-xs space-y-2 text-slate-600">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Гэрийн эзэд:</span>
                      <span className="font-medium text-slate-900">{config.hosts}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Огноо, цаг:</span>
                      <span className="font-medium text-slate-900">
                        {config.year}.{config.month}.{config.day} ({config.timeRange})
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Хаяг:</span>
                      <span className="font-medium text-slate-900 truncate max-w-[200px]">
                        {config.locationAddress}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Хот / Дүүрэг:</span>
                      <span className="font-medium text-slate-900">{config.locationCity}, {config.locationDistrict}</span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-center cursor-pointer transition-colors"
                    >
                      Хаяг, огноо, бичвэр засах
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RSVPS */}
          {activeTab === 'rsvps' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">
                    Ирэх зочдын бүртгэл
                  </h3>
                  <p className="text-xs text-slate-500">
                    Нийт {rsvps.length} хариу бүртгэгдсэн ({totalGuests} хүн ирнэ)
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Day Filter Tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setDayFilter('all')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                        dayFilter === 'all'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Бүгд ({rsvps.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDayFilter('10-23')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                        dayFilter === '10-23'
                          ? 'bg-white text-amber-800 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      10.23 Баасан ({rsvps.filter(r => (r.event_day || '10-23') === '10-23').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDayFilter('10-24')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                        dayFilter === '10-24'
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      10.24 Бямба ({rsvps.filter(r => r.event_day === '10-24').length})
                    </button>
                  </div>

                  <button
                    onClick={handleExportRsvpsCsv}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV Татах</span>
                  </button>
                </div>
              </div>

              {/* RSVP Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Зочны нэр</th>
                        <th className="py-3 px-4 font-semibold">Цайллагын өдөр</th>
                        <th className="py-3 px-4 font-semibold">Ирэх эсэх</th>
                        <th className="py-3 px-4 font-semibold">Нийт тоо</th>
                        <th className="py-3 px-4 font-semibold">Том хүн</th>
                        <th className="py-3 px-4 font-semibold">Хүүхэд</th>
                        <th className="py-3 px-4 font-semibold">Утас / Зурвас</th>
                        <th className="py-3 px-4 font-semibold">Бүртгүүлсэн</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rsvps
                        .filter((r) => dayFilter === 'all' || (r.event_day || '10-23') === dayFilter)
                        .map((rsvp) => (
                        <tr key={rsvp.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-medium text-slate-900">
                            {rsvp.guest_name}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                                rsvp.event_day === '10-24'
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                              }`}
                            >
                              {rsvp.event_day === '10-24' ? '10.24 (Бямба)' : '10.23 (Баасан)'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {rsvp.attending === 'no' ? (
                              <span className="text-slate-500">Амжихгүй</span>
                            ) : rsvp.attending === 'with_family' ? (
                              <span className="text-indigo-700 font-medium">Гэр бүлээрээ 🤍</span>
                            ) : (
                              <span className="text-emerald-700 font-medium">Ирнэ 🤍</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-semibold tabular-nums text-slate-900">
                            {rsvp.attending !== 'no' && rsvp.guest_count > 0 ? `${rsvp.guest_count} хүн` : '—'}
                          </td>
                          <td className="py-3 px-4 tabular-nums text-slate-700">
                            {rsvp.attending !== 'no' ? `${rsvp.adults ?? rsvp.guest_count} том хүн` : '—'}
                          </td>
                          <td className="py-3 px-4 tabular-nums text-slate-700">
                            {rsvp.attending !== 'no' && (rsvp.children ?? 0) > 0 ? `${rsvp.children} хүүхэд` : '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                            {rsvp.phone_or_note || '—'}
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {new Date(rsvp.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BLESSINGS MODERATION */}
          {activeTab === 'blessings' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  {(['pending', 'approved', 'rejected', 'hidden', 'all'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setBlessingFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
                        blessingFilter === st
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st === 'pending' && `Хүлээгдэж буй (${pendingBlessings.length})`}
                      {st === 'approved' && `Батлагдсан (${approvedBlessings.length})`}
                      {st === 'rejected' && `Татгалзсан (${rejectedBlessings.length})`}
                      {st === 'hidden' && `Нуусан (${hiddenBlessings.length})`}
                      {st === 'all' && `Бүгд (${blessings.length})`}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Нэрээр хайх..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              {/* Blessings List */}
              <div className="space-y-3">
                {filteredBlessings.length === 0 ? (
                  <div className="bg-white p-12 text-center text-xs text-slate-400 rounded-xl border border-slate-200">
                    Энэ ангилалд ямар нэг ерөөл олдсонгүй.
                  </div>
                ) : (
                  filteredBlessings.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-sm">
                            {b.guest_name}
                          </span>
                          {b.anonymous && (
                            <span className="text-[10px] text-slate-400 italic">
                              (Нэргүй)
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                              b.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : b.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>

                        <span className="text-[11px] text-slate-400">
                          {new Date(b.created_at).toLocaleString()}
                        </span>
                      </div>

                      {editingBlessingId === b.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editBlessingMsg}
                            onChange={(e) => setEditBlessingMsg(e.target.value)}
                            rows={3}
                            className="w-full p-2 text-xs border border-slate-300 rounded-lg"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setEditingBlessingId(null)}
                              className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded"
                            >
                              Болих
                            </button>
                            <button
                              onClick={() => handleSaveBlessingEdit(b.id)}
                              className="px-3 py-1 text-xs text-white bg-slate-900 rounded font-medium"
                            >
                              Хадгалах
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                          “{b.message}”
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                          <span>❤️ {b.reactions?.heart || 0}</span>
                          <span>✨ {b.reactions?.sparkle || 0}</span>
                          <span>🙏 {b.reactions?.pray || 0}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingBlessingId(b.id);
                              setEditBlessingMsg(b.message);
                            }}
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Засах</span>
                          </button>

                          {b.status !== 'approved' && (
                            <button
                              onClick={() => handleApproveBlessing(b.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Батлах (Нийтлэх)</span>
                            </button>
                          )}

                          {b.status === 'approved' && (
                            <button
                              onClick={() => handleHideBlessing(b.id)}
                              className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded flex items-center gap-1 cursor-pointer"
                            >
                              <EyeOff className="w-3 h-3" />
                              <span>Нуух</span>
                            </button>
                          )}

                          {b.status !== 'rejected' && (
                            <button
                              onClick={() => handleRejectBlessing(b.id)}
                              className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Татгалзах</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteBlessing(b.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                            title="Устгах"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: EVENT SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-900 text-sm mb-4">
                Шинэ гэрийн цайллагын үндсэн тохиргоо
              </h3>

              <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Гэрийн эздийн нэр
                    </label>
                    <input
                      type="text"
                      value={editingConfig.hosts}
                      onChange={(e) =>
                        setEditingConfig({ ...editingConfig, hosts: e.target.value })
                      }
                      className="w-full p-2.5 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Эвент гарчиг
                    </label>
                    <input
                      type="text"
                      value={editingConfig.title}
                      onChange={(e) =>
                        setEditingConfig({ ...editingConfig, title: e.target.value })
                      }
                      className="w-full p-2.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Он</label>
                    <input
                      type="number"
                      value={editingConfig.year}
                      onChange={(e) =>
                        setEditingConfig({ ...editingConfig, year: parseInt(e.target.value) || 2026 })
                      }
                      className="w-full p-2.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Сар</label>
                    <input
                      type="number"
                      value={editingConfig.month}
                      onChange={(e) =>
                        setEditingConfig({ ...editingConfig, month: parseInt(e.target.value) || 10 })
                      }
                      className="w-full p-2.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">1-р өдөр</label>
                    <input
                      type="number"
                      value={editingConfig.day}
                      onChange={(e) =>
                        setEditingConfig({ ...editingConfig, day: parseInt(e.target.value) || 23 })
                      }
                      className="w-full p-2.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">2-р өдөр</label>
                    <input
                      type="number"
                      value={editingConfig.day2 || 24}
                      onChange={(e) =>
                        setEditingConfig({ ...editingConfig, day2: parseInt(e.target.value) || 24 })
                      }
                      className="w-full p-2.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Цагийн интервал
                  </label>
                  <input
                    type="text"
                    value={editingConfig.timeRange}
                    onChange={(e) =>
                      setEditingConfig({ ...editingConfig, timeRange: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Хот</label>
                    <input
                      type="text"
                      value={editingConfig.locationCity}
                      onChange={(e) =>
                        setEditingConfig({ ...editingConfig, locationCity: e.target.value })
                      }
                      className="w-full p-2.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Дүүрэг, хороо</label>
                    <input
                      type="text"
                      value={editingConfig.locationDistrict}
                      onChange={(e) =>
                        setEditingConfig({ ...editingConfig, locationDistrict: e.target.value })
                      }
                      className="w-full p-2.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Байрны дэлгэрэнгүй хаяг
                  </label>
                  <input
                    type="text"
                    value={editingConfig.locationAddress}
                    onChange={(e) =>
                      setEditingConfig({ ...editingConfig, locationAddress: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Google Maps холбоос
                  </label>
                  <input
                    type="url"
                    value={editingConfig.googleMapsUrl}
                    onChange={(e) =>
                      setEditingConfig({ ...editingConfig, googleMapsUrl: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Урилгын эхлэл тайлбар
                  </label>
                  <textarea
                    rows={2}
                    value={editingConfig.introSubtext}
                    onChange={(e) =>
                      setEditingConfig({ ...editingConfig, introSubtext: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Тохиргоог хадгалах</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
