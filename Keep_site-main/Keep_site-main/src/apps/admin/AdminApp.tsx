import { format } from 'date-fns';
import { LayoutDashboard, Users, Activity, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';
import { LanguageToggle } from '../../components/LanguageToggle';
import { useTranslation } from 'react-i18next';
import { useRequests, useAdminStats } from '../../hooks/useRequests';

export const AdminApp = () => {
  const { t } = useTranslation();

  // useRequests: 요청 목록 (GET /requests 로 교체 가능)
  const { requests } = useRequests();

  // useAdminStats: 통계 (GET /admin/stats 로 교체 가능)
  const stats = useAdminStats();

  return (
    <div className="app-container" style={{ maxWidth: '1400px' }}>
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold">{t('KEEP Admin Dashboard')}</h1>
          <p className="text-muted mt-2">{t('Real-time overview of NFC fitting requests and operations.')}</p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LanguageToggle />
          <button className="btn btn-secondary">
            <LayoutDashboard size={18} /> {t('Export Data')}
          </button>
        </div>
      </div>

      {/* 통계 카드 — useAdminStats() / GET /admin/stats */}
      <div className="grid-cols-4 mb-8">
        <div className="card p-6 flex items-center gap-4 animate-slide-in" style={{ animationDelay: '0ms' }}>
          <div style={{ background: '#e0e7ff', padding: '1rem', borderRadius: '50%', color: '#4f46e5' }}>
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted">{t('Total Requests')}</p>
            <h2 className="text-2xl font-bold">{stats.total}</h2>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4 animate-slide-in" style={{ animationDelay: '50ms' }}>
          <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '50%', color: '#d97706' }}>
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted">{t('Awaiting Prep (Pending)')}</p>
            <h2 className="text-2xl font-bold">{stats.pending}</h2>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4 animate-slide-in" style={{ animationDelay: '100ms' }}>
          <div style={{ background: '#bfdbfe', padding: '1rem', borderRadius: '50%', color: '#2563eb' }}>
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted">{t('In Progress (Assigned)')}</p>
            <h2 className="text-2xl font-bold">{stats.assigned}</h2>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4 animate-slide-in" style={{ animationDelay: '150ms' }}>
          <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '50%', color: '#16a34a' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-muted">{t('Completed Requests')}</p>
            <h2 className="text-2xl font-bold">{stats.completed}</h2>
          </div>
        </div>
      </div>

      {/* 요청 로그 테이블 — useRequests() / GET /requests */}
      <h2 className="text-xl font-bold mb-4">{t('Live Request Log')}</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{t('Time')}</th>
              <th>{t('Req ID')}</th>
              <th>{t('Fitting Room')}</th>
              <th>{t('Product')}</th>
              <th>{t('Status')}</th>
              <th>{t('Elapsed')}</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => {
              const elapsedMins = Math.floor((Date.now() - req.requestTime) / 60000);
              return (
                <tr key={req.requestId}>
                  <td className="font-medium">{format(req.requestTime, 'HH:mm:ss')}</td>
                  <td className="text-sm text-muted">{req.requestId.slice(-6)}</td>
                  <td className="font-bold" style={{ textAlign: 'center' }}>Room {req.fittingRoomId}</td>
                  {/* 단일 상품 — 백엔드 구조: 요청 1개 = 상품 1개 */}
                  <td className="text-sm">
                    <span title={`${req.color} / ${req.size}`}>
                      {req.productName}
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.75rem', marginLeft: '4px' }}>
                      ({req.color} / {req.size})
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${req.status}`}>{t(req.status)}</span>
                  </td>
                  <td className="text-sm text-muted">
                    {req.status === 'completed' ? t('Done') : `${elapsedMins} ${t('min ago')}`}
                  </td>
                </tr>
              );
            })}
            {requests.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted">
                  {t('No request logs available.')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
