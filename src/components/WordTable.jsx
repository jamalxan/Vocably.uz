'use client';
import { useState } from 'react';
import { Volume2, Trash2, Search } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { speakText } from '@/lib/speech';

export default function WordTable() {
  const { activeCategory, handleAddWord, handleDeleteWord } = useApp();
  const [newWord, setNewWord] = useState('');
  const [newSyns, setNewSyns] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const onAddWord = () => {
    handleAddWord(newWord, newSyns);
    setNewWord('');
    setNewSyns('');
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-end">
        <div className="flex-1 w-full">
          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Yangi so'z</label>
          <input
            type="text"
            placeholder="Masalan: Start"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onAddWord();
            }}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex-[2] w-full">
          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
            Sinonimlar / tarjima, vergul bilan
          </label>
          <input
            type="text"
            placeholder="Masalan: begin, commence, launch"
            value={newSyns}
            onChange={(e) => setNewSyns(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onAddWord();
            }}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
          />
        </div>
        <button
          onClick={onAddWord}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors whitespace-nowrap"
        >
          Qo'shish
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="So'z yoki tarjimalar bo'yicha qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm outline-none focus:border-indigo-500"
        />
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[480px]">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-4 sm:px-6 w-12">#</th>
                <th className="py-3 px-4 sm:px-6">So'z</th>
                <th className="py-3 px-4 sm:px-6">Sinonimlar / tarjimalar</th>
                <th className="py-3 px-4 sm:px-6 w-24">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {(activeCategory.words || [])
                .map((w, idx) => ({ ...w, idx }))
                .filter(
                  (w) =>
                    w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    w.syns.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map((w) => (
                  <tr key={w.idx} className="border-b border-slate-50 hover:bg-slate-50/50 text-sm">
                    <td className="py-3.5 px-4 sm:px-6 text-slate-400 font-mono text-xs">{w.idx + 1}</td>
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-800">{w.word}</td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">{w.syns.join(', ')}</td>
                    <td className="py-3.5 px-4 sm:px-6 flex gap-2">
                      <button
                        onClick={() => speakText(w.word)}
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded transition-colors"
                        title="Eshitish"
                      >
                        <Volume2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteWord(w.idx)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              {(activeCategory.words || []).length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-sm text-slate-400">
                    Bu kategoriyada hali so'z yo'q.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
