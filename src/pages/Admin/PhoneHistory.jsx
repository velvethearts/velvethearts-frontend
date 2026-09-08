import React, { useState } from 'react';
import { api } from '../../lib/api';
import { PageHeader } from '../../components/UI/PageHeader';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Input } from '../../components/UI/Input';
import { MagnifyingGlass, Warning, ClockCounterClockwise, Check } from '@phosphor-icons/react';

export const PhoneHistory = ({ onBack }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyList, setHistoryList] = useState(null);
  const [searchedPhone, setSearchedPhone] = useState('');
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const formatted = phoneNumber.trim();
    if (!formatted) return;

    setLoading(true);
    setError('');
    setSearchedPhone(formatted);
    try {
      if (api.isConfigured) {
        const data = await api.admin.getPhoneHistory(formatted);
        setHistoryList(Array.isArray(data) ? data : []);
      } else {
        setHistoryList([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to search history.');
      setHistoryList([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="phone-history-page page-enter">
      <PageHeader
        title="Audit Logs"
        subtitle="Track registration logs and previous verifications by phone number."
        onBack={onBack}
      />

      <Card className="search-card font-ui">
        <form onSubmit={handleSearch} className="search-form">
          <Input
            id="phone-search"
            label="Search Phone Number"
            placeholder="e.g. +919876543210"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            autoFocus
          />
          <Button type="submit" variant="primary" loading={loading} className="search-btn">
            <MagnifyingGlass size={20} />
            <span>Search Audit Log</span>
          </Button>
        </form>
      </Card>

      {/* Results */}
      {searchedPhone && (
        <div className="search-results font-ui">
          <h2 className="results-title">
            <ClockCounterClockwise size={20} />
            <span>Audit Trail for {searchedPhone}</span>
          </h2>

          {loading ? (
            <div className="results-loader">
              <div className="results-spinner" />
              <p>Searching logs...</p>
            </div>
          ) : error ? (
            <div className="results-error font-body">
              <Warning size={24} className="font-error" />
              <span>{error}</span>
            </div>
          ) : historyList && historyList.length > 0 ? (
            <div className="results-timeline">
              {historyList.map((log, index) => (
                <Card key={log.id || index} className="timeline-card">
                  <div className="timeline-header">
                    <span className={`status-pill status-${log.approvalStatus.toLowerCase()}`}>
                      {log.approvalStatus}
                    </span>
                    <span className="log-date">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="timeline-details font-body">
                    <div className="detail-item">
                      <strong>Prisma Status:</strong>
                      <span>{log.status}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Role:</strong>
                      <span>{log.role}</span>
                    </div>
                    {log.deletedAt && (
                      <div className="detail-item font-error">
                        <strong>Deleted At:</strong>
                        <span>{new Date(log.deletedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="empty-results font-body">
              <p>No registration history logs found for this number.</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        .phone-history-page {
          max-width: var(--content-max-width);
          margin: 0 auto;
          padding: var(--space-6) var(--space-4) var(--space-12);
        }

        .search-card {
          padding: var(--space-5);
          margin-bottom: var(--space-6);
        }

        .search-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          align-items: flex-end;
        }

        .search-form > div {
          width: 100%;
        }

        .search-btn {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          width: 100%;
        }

        @media (min-width: 576px) {
          .search-btn {
            width: auto;
          }
        }

        .search-results {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .results-title {
          font-size: var(--text-body);
          font-weight: bold;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-2);
        }

        .results-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-8);
          gap: var(--space-3);
          color: var(--text-secondary);
        }

        .results-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border-default);
          border-top-color: var(--burgundy-500);
          border-radius: 50%;
          animation: hspin 0.8s linear infinite;
        }

        @keyframes hspin {
          to { transform: rotate(360deg); }
        }

        .results-error {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          background-color: var(--error-light);
          border: 1.5px solid var(--error);
          color: var(--error);
          padding: var(--space-4);
          border-radius: var(--radius-md);
        }

        .results-timeline {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .timeline-card {
          padding: var(--space-4);
        }

        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: var(--space-2);
          margin-bottom: var(--space-3);
        }

        .log-date {
          font-size: var(--text-caption);
          color: var(--text-muted);
        }

        .status-pill {
          font-size: var(--text-caption);
          font-weight: bold;
          padding: 2px var(--space-2);
          border-radius: var(--radius-sm);
          text-transform: uppercase;
        }

        .status-approved { background-color: var(--success-light); color: var(--success); }
        .status-pending { background-color: var(--gold-550, #D4AD6A); color: #fff; }
        .status-rejected { background-color: var(--error-light); color: var(--error); }

        .timeline-details {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          font-size: var(--text-body-sm);
        }

        .detail-item strong {
          color: var(--text-secondary);
        }

        .detail-item span {
          color: var(--text-primary);
        }

        .empty-results {
          color: var(--text-secondary);
          font-style: italic;
          padding: var(--space-6);
          background-color: var(--bg-surface);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          text-align: center;
        }
      `}</style>
    </div>
  );
};
