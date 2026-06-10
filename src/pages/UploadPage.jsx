import { useState, useEffect } from 'react';
import accountService from '../services/accountService';
import transactionService from '../services/transactionService';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UploadPage() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => { fetchAccounts(); }, []);

  const fetchAccounts = async () => {
    try {
      const res = await accountService.getAccounts();
      setAccounts(res.data.accounts || []);
      if (res.data.accounts?.length > 0) {
        setSelectedAccount(res.data.accounts[0].id);
      }
    } catch { toast.error('Failed to load accounts'); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSetFile(dropped);
  };

  const validateAndSetFile = (f) => {
    const allowed = ['text/csv', 'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/pdf'];
    const allowedExt = ['.csv', '.xlsx', '.xls', '.pdf'];
    const ext = '.' + f.name.split('.').pop().toLowerCase();

    if (!allowed.includes(f.type) && !allowedExt.includes(ext)) {
      toast.error('Only CSV, XLSX, XLS, PDF files allowed');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File size must be under 10MB');
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file');
    if (!selectedAccount) return toast.error('Please select an account');

    setUploading(true);
    try {
      const res = await transactionService.uploadFile(selectedAccount, file);
      setResult({ success: true, total: res.data.total });
      toast.success(`${res.data.total} transactions imported!`);
      setFile(null);
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || 'Upload failed' });
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return '📄';
    if (ext === 'csv') return '📊';
    return '📗';
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>
          Upload Bank Statement
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
          Import transactions from CSV, Excel, or PDF bank statements
        </p>
      </div>

      {/* Supported Formats */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap'
      }}>
        {[
          { ext: 'CSV', color: '#22c55e', desc: 'Comma separated' },
          { ext: 'XLSX', color: '#3b82f6', desc: 'Excel spreadsheet' },
          { ext: 'XLS', color: '#6366f1', desc: 'Excel 97-2003' },
          { ext: 'PDF', color: '#ef4444', desc: 'Bank statement PDF' }
        ].map(f => (
          <div key={f.ext} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'white', borderRadius: '10px', padding: '10px 16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: `1.5px solid ${f.color}30`
          }}>
            <span style={{
              background: `${f.color}15`, color: f.color,
              fontSize: '11px', fontWeight: 700,
              padding: '2px 8px', borderRadius: '4px'
            }}>
              {f.ext}
            </span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{f.desc}</span>
          </div>
        ))}
      </div>

      {/* Account Selector */}
      <div style={{
        background: 'white', borderRadius: '14px', padding: '20px',
        marginBottom: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
      }}>
        <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '10px' }}>
          Select Account
        </label>
        {accounts.length === 0 ? (
          <p style={{ color: '#ef4444', fontSize: '14px' }}>
            ⚠️ No accounts found. Please create an account first.
          </p>
        ) : (
          <select
            value={selectedAccount}
            onChange={e => setSelectedAccount(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px',
              border: '1.5px solid #e2e8f0', borderRadius: '8px',
              fontSize: '14px', outline: 'none',
              background: 'white', cursor: 'pointer'
            }}
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} — {acc.type}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        style={{
          border: `2px dashed ${dragging ? '#6366f1' : '#cbd5e1'}`,
          borderRadius: '16px', padding: '48px 24px',
          textAlign: 'center', cursor: 'pointer',
          background: dragging ? '#eef2ff' : 'white',
          transition: 'all 0.2s', marginBottom: '16px'
        }}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <input
          id="fileInput" type="file"
          accept=".csv,.xlsx,.xls,.pdf"
          style={{ display: 'none' }}
          onChange={e => e.target.files[0] && validateAndSetFile(e.target.files[0])}
        />

        {file ? (
          <div>
            <span style={{ fontSize: '48px' }}>{getFileIcon(file.name)}</span>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginTop: '12px' }}>
              {file.name}
            </p>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              {formatSize(file.size)}
            </p>
            <button
              onClick={e => { e.stopPropagation(); setFile(null); }}
              style={{
                marginTop: '12px', background: '#fef2f2',
                border: 'none', borderRadius: '8px',
                padding: '6px 12px', cursor: 'pointer',
                color: '#ef4444', fontSize: '13px',
                display: 'inline-flex', alignItems: 'center', gap: '4px'
              }}
            >
              <X size={12} /> Remove
            </button>
          </div>
        ) : (
          <div>
            <div style={{
              background: '#eef2ff', borderRadius: '50%',
              width: '64px', height: '64px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 16px'
            }}>
              <Upload size={28} color="#6366f1" />
            </div>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
              Drop your file here
            </p>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
              or click to browse — CSV, XLSX, XLS, PDF supported
            </p>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading || accounts.length === 0}
        style={{
          width: '100%', padding: '14px',
          background: !file || uploading ? '#a5b4fc' : '#6366f1',
          color: 'white', border: 'none', borderRadius: '12px',
          fontSize: '15px', fontWeight: 600,
          cursor: !file || uploading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '8px'
        }}
      >
        {uploading ? (
          <>
            <div style={{
              width: '16px', height: '16px', border: '2px solid white',
              borderTop: '2px solid transparent', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            Processing with AI...
          </>
        ) : (
          <><FileText size={18} /> Import Transactions</>
        )}
      </button>

      {/* Result */}
      {result && (
        <div style={{
          marginTop: '16px', padding: '16px', borderRadius: '12px',
          background: result.success ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${result.success ? '#86efac' : '#fca5a5'}`,
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          {result.success
            ? <CheckCircle size={20} color="#22c55e" />
            : <AlertCircle size={20} color="#ef4444" />
          }
          <p style={{
            fontSize: '14px', fontWeight: 500,
            color: result.success ? '#15803d' : '#dc2626'
          }}>
            {result.success
              ? `✅ Successfully imported ${result.total} transactions with AI categorization!`
              : `❌ ${result.message}`
            }
          </p>
        </div>
      )}

      {/* Tips */}
      <div style={{
        marginTop: '24px', background: '#fffbeb',
        borderRadius: '12px', padding: '16px',
        border: '1px solid #fde68a'
      }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: '#92400e', marginBottom: '8px' }}>
          💡 Tips for best results
        </p>
        {[
          'CSV should have columns: date, description, amount, type',
          'Excel first sheet is used — ensure headers in row 1',
          'PDF works best with standard bank statement format',
          'AI will auto-categorize each transaction (Food, Transport, etc.)'
        ].map((tip, i) => (
          <p key={i} style={{ fontSize: '12px', color: '#78350f', marginTop: '4px' }}>
            • {tip}
          </p>
        ))}
      </div>
    </div>
  );
}