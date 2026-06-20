import { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { labReportApi } from '../api/labReportApi';
import { formatDate } from '../utils/formatters';

export default function LabReportsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Form State
  const [reportForm, setReportForm] = useState({
    reportName: '',
    reportType: 'Blood Test',
    labName: '',
    reportDate: '',
    orderedByDoctor: '',
  });

  // Dynamic rows of test results
  const [resultsRows, setResultsRows] = useState([
    { test_name: '', value: '', unit: '', reference_range: '', status: 'normal' }
  ]);

  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [explainingId, setExplainingId] = useState(null);

  const fetchData = () => {
    setLoading(true);
    labReportApi.list({ search, page: 1, limit: 100 })
      .then(res => {
        setItems(res.data?.data || []);
      })
      .catch((err) => {
        console.error("Failed to load lab reports:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleReportChange = (e) => {
    const { name, value } = e.target;
    setReportForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRowChange = (index, field, value) => {
    setResultsRows(prev => prev.map((row, idx) => {
      if (idx === index) {
        const updatedRow = { ...row, [field]: value };
        
        // Auto-determine status if they enter a value and a range like "10 - 20"
        if (field === 'value' || field === 'reference_range') {
          const valNum = parseFloat(updatedRow.value);
          const rangeMatch = updatedRow.reference_range.match(/^([\d.]+)\s*-\s*([\d.]+)$/);
          if (!isNaN(valNum) && rangeMatch) {
            const min = parseFloat(rangeMatch[1]);
            const max = parseFloat(rangeMatch[2]);
            if (valNum < min) {
              updatedRow.status = 'low';
            } else if (valNum > max) {
              updatedRow.status = 'high';
            } else {
              updatedRow.status = 'normal';
            }
          }
        }
        return updatedRow;
      }
      return row;
    }));
  };

  const addResultRow = () => {
    setResultsRows(prev => [...prev, { test_name: '', value: '', unit: '', reference_range: '', status: 'normal' }]);
  };

  const removeResultRow = (index) => {
    if (resultsRows.length === 1) return;
    setResultsRows(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Form validation
    const invalidRow = resultsRows.find(r => !r.test_name || !r.value);
    if (invalidRow) {
      setFormError('Please enter a Test Name and Value for all rows.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        ...reportForm,
        results: resultsRows,
        status: 'final',
      };

      const res = await labReportApi.create(payload);
      if (res.data?.success) {
        const newReport = res.data.data;
        setShowCreate(false);
        setReportForm({
          reportName: '',
          reportType: 'Blood Test',
          labName: '',
          reportDate: '',
          orderedByDoctor: '',
        });
        setResultsRows([{ test_name: '', value: '', unit: '', reference_range: '', status: 'normal' }]);
        
        // Expand the new report card
        setExpandedId(newReport.id);
        
        // Automatically fetch AI explanation for the newly created report!
        setExplainingId(newReport.id);
        try {
          await labReportApi.aiExplain(newReport.id);
        } catch (aiErr) {
          console.error("Auto AI explanation failed:", aiErr);
        } finally {
          setExplainingId(null);
        }

        fetchData();
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to add lab report';
      const details = err.response?.data?.errors?.map(e => e.message).join(', ');
      setFormError(details ? `${msg}: ${details}` : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAiExplain = async (id) => {
    setExplainingId(id);
    try {
      await labReportApi.aiExplain(id);
      fetchData(); // Refresh to load updated ai_explanation field
    } catch (err) {
      console.error("AI explanation failed:", err);
      alert("Failed to generate AI explanation. Please check OpenAI configuration.");
    } finally {
      setExplainingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this lab report?')) return;
    try {
      await labReportApi.delete(id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Failed to delete lab report:", err);
      alert("Failed to delete lab report.");
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
            Lab Reports
          </h1>
          <p className="text-slate-400 text-sm mt-1">Log laboratory tests and receive plain-language AI explanations</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
          + Add Lab Values
        </Button>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search by report name, lab name, or doctor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300">
            ✕
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner size="lg" className="min-h-[40vh]" />
      ) : items.length === 0 ? (
        <EmptyState 
          icon="🔬" 
          title="No lab reports found" 
          description={search ? "Try adjusting your search query." : "Log your blood test or lab values manually to get visual indicators and instant AI explanations."} 
          action={!search && <Button onClick={() => setShowCreate(true)}>Add Lab Values</Button>} 
        />
      ) : (
        <div className="space-y-4">
          {items.map(item => {
            const isExpanded = expandedId === item.id;
            return (
              <div 
                key={item.id} 
                className="bg-white/5 border border-white/5 rounded-2xl transition-all duration-300 overflow-hidden"
              >
                {/* Collapsible header */}
                <div 
                  onClick={() => toggleExpand(item.id)}
                  className="p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.08] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-slate-100">{item.report_name}</h3>
                      <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-medium">
                        {item.report_type}
                      </span>
                      <StatusBadge status={item.status || 'final'} />
                    </div>
                    <p className="text-sm text-slate-400 mt-1">
                      <span className="text-teal-400 font-medium">🏥 {item.lab_name || 'Generic Lab'}</span>
                      {item.ordered_by_doctor && <span className="text-slate-500"> • Ordered by: Dr. {item.ordered_by_doctor}</span>}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Report Date: {formatDate(item.report_date)}</p>
                  </div>
                  <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-500 hover:text-red-400 text-xs transition-colors p-2"
                      title="Delete record"
                    >
                      🗑️
                    </button>
                    <span className="text-xs text-slate-400">
                      {isExpanded ? 'Collapse ▴' : 'Expand ▾'}
                    </span>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-white/5 p-6 bg-slate-950/40 space-y-6">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Lab Results & Values</h4>
                      
                      {/* Results Table */}
                      <div className="overflow-x-auto rounded-xl border border-white/5">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-white/5 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                              <th className="p-3 pl-4">Test Name</th>
                              <th className="p-3">Value</th>
                              <th className="p-3">Reference Range</th>
                              <th className="p-3 pr-4 text-right">Range Indicator</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                            {(item.results || []).map((res, idx) => {
                              const isNormal = !res.status || res.status.toLowerCase() === 'normal';
                              return (
                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="p-3 pl-4 font-medium text-slate-200">{res.test_name}</td>
                                  <td className="p-3 font-semibold text-white">
                                    {res.value} <span className="text-slate-500 font-normal text-xs">{res.unit}</span>
                                  </td>
                                  <td className="p-3 text-slate-400 text-xs">{res.reference_range || '—'}</td>
                                  <td className="p-3 pr-4 text-right">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                      isNormal 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                                        : 'bg-red-500/10 text-red-400 border-red-500/25'
                                    }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${isNormal ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                      {isNormal ? 'Normal Range' : (res.status ? res.status.toUpperCase() : 'Out of Range')}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* AI Explanation Box */}
                    <div className="bg-gradient-to-br from-teal-950/30 to-cyan-950/30 border border-teal-500/20 rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🤖</span>
                          <h4 className="text-sm font-semibold text-teal-400">DocBridge AI lab interpreter</h4>
                        </div>
                        {!item.ai_explanation && !explainingId && (
                          <Button 
                            onClick={(e) => { e.stopPropagation(); handleAiExplain(item.id); }}
                            className="py-1 px-3 text-xs bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30"
                          >
                            Generate Interpretation
                          </Button>
                        )}
                      </div>

                      {explainingId === item.id ? (
                        <div className="flex items-center gap-3 text-sm text-slate-400 py-2">
                          <LoadingSpinner size="sm" />
                          <span>AI is interpreting your biomarker levels and correlating with standard references...</span>
                        </div>
                      ) : item.ai_explanation ? (
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                          {item.ai_explanation}
                        </p>
                      ) : (
                        <p className="text-slate-500 text-xs italic">
                          No AI interpretation found. Click "Generate Interpretation" to decode your lab biomarkers.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Log Manual Lab Values">
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {formError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Report Name" 
              name="reportName" 
              value={reportForm.reportName} 
              onChange={handleReportChange} 
              placeholder="e.g. Lipid Panel, Thyroid Test" 
              required 
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Report Type</label>
              <select
                name="reportType"
                value={reportForm.reportType}
                onChange={handleReportChange}
                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm"
              >
                <option value="Blood Test">Blood Test</option>
                <option value="Urine Test">Urine Test</option>
                <option value="Biopsy">Biopsy</option>
                <option value="Swab Test">Swab Test</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Lab Name / Hospital" 
              name="labName" 
              value={reportForm.labName} 
              onChange={handleReportChange} 
              placeholder="e.g. Quest Diagnostics" 
              required 
            />
            <Input 
              label="Report Date" 
              type="date" 
              name="reportDate" 
              value={reportForm.reportDate} 
              onChange={handleReportChange} 
              required 
            />
          </div>

          <Input 
            label="Ordered By Doctor (Optional)" 
            name="orderedByDoctor" 
            value={reportForm.orderedByDoctor} 
            onChange={handleReportChange} 
            placeholder="e.g. Dr. John Watson" 
          />

          {/* Manually Inputting Test Rows */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-teal-400">Manual Biomarker Inputs</h4>
              <button 
                type="button" 
                onClick={addResultRow} 
                className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
              >
                + Add Value Row
              </button>
            </div>

            <div className="space-y-3">
              {resultsRows.map((row, idx) => (
                <div key={idx} className="flex gap-2 items-end bg-white/5 p-3 rounded-xl border border-white/5 relative">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-5 gap-2">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400 block mb-0.5">Biomarker / Test Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Hemoglobin" 
                        value={row.test_name} 
                        onChange={e => handleRowChange(idx, 'test_name', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Value</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 14.2" 
                        value={row.value} 
                        onChange={e => handleRowChange(idx, 'value', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Unit</label>
                      <input 
                        type="text" 
                        placeholder="e.g. g/dL" 
                        value={row.unit} 
                        onChange={e => handleRowChange(idx, 'unit', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Ref Range</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 12.0 - 16.0" 
                        value={row.reference_range} 
                        onChange={e => handleRowChange(idx, 'reference_range', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-white text-xs placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 justify-end">
                    <label className="text-[10px] text-slate-400 block">Status</label>
                    <select
                      value={row.status}
                      onChange={e => handleRowChange(idx, 'status', e.target.value)}
                      className="px-1 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-white text-[11px] focus:outline-none focus:ring-1 focus:ring-teal-500/50"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="low">Low</option>
                      <option value="abnormal">Abnormal</option>
                    </select>
                  </div>

                  {resultsRows.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeResultRow(idx)}
                      className="text-slate-500 hover:text-red-400 text-sm pb-1.5"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={submitting} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600">
              Save & Explain
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
