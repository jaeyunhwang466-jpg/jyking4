import { useRequests } from '../../hooks/useRequests';
import { Clock, CheckSquare, Shirt } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import { ThemeToggle } from '../../components/ThemeToggle';
import { LanguageToggle } from '../../components/LanguageToggle';
import { useTranslation } from 'react-i18next';
import { mockProducts } from '../../mock/products';
import type { FittingStatus } from '../../types/request';

export const StaffApp = () => {
  const { t, i18n } = useTranslation();

  // useRequests hook — getRequests()/updateStatus() 를 통해 서비스 계층 사용
  // 실제 API 연동 시 hook 내부만 변경, 이 컴포넌트는 수정 불필요
  const { requests, updateStatus } = useRequests();

  const handleStatusChange = async (requestId: string, nextStatus: FittingStatus) => {
    await updateStatus(requestId, nextStatus);
  };

  return (
    <div className="app-container">
      <div className="page-header">
        <div>
          <h1 className="text-3xl font-bold">{t('KEEP Staff Portal')}</h1>
          <p className="text-muted mt-2">{t('Manage fitting requests for NFC customers.')}</p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>

      <div className="flex-col gap-4">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-muted" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)' }}>
            {t('No fitting requests at the moment.')}
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.requestId} className="card p-4 flex-col gap-4 animate-slide-in">
              <div className="flex justify-between items-start border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-bold text-lg">{t('Fitting Room')} {req.fittingRoomId}</span>
                    <span className={`status-badge ${req.status}`}>{t(req.status)}</span>
                  </div>
                  <div className="text-sm text-muted flex items-center gap-1">
                    <Clock size={14}/>
                    {formatDistanceToNow(req.requestTime, {
                      addSuffix: true,
                      locale: i18n.language === 'ko' ? ko : enUS,
                    })}
                  </div>
                </div>

                {/* 상태 변경 버튼 — PATCH /requests/:id/status 로 교체 가능 */}
                <div className="flex gap-2">
                  {req.status === 'pending' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleStatusChange(req.requestId, 'assigned')}
                    >
                      {t('Start Preparing')}
                    </button>
                  )}
                  {req.status === 'assigned' && (
                    <button
                      className="btn btn-secondary"
                      style={{ background: '#10b981', color: 'white', borderColor: '#10b981' }}
                      onClick={() => handleStatusChange(req.requestId, 'completed')}
                    >
                      <CheckSquare size={18} /> {t('Complete')}
                    </button>
                  )}
                </div>
              </div>

              {/* 단일 상품 표시 — 백엔드 구조: 요청 1개 = 상품 1개 */}
              <div>
                <h4 className="text-sm font-semibold text-muted mb-3 flex items-center gap-2">
                  <Shirt size={16} /> {t('Requested Item')}
                </h4>
                <div className="flex gap-3 items-center p-3" style={{ background: 'var(--surface-hover)', borderRadius: '8px' }}>
                  {(() => {
                    const productDef = mockProducts.find(p => p.id === req.productId);
                    return (
                      <>
                        {productDef && (
                          <img
                            src={productDef.imageUrl}
                            alt={req.productName}
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        )}
                        <div>
                          <p className="font-medium">{req.productName}</p>
                          <p className="text-sm text-muted flex gap-2 mt-1">
                            <span>{t('Color')}: <strong style={{ color: 'var(--text-primary)' }}>{req.color}</strong></span>
                            <span>|</span>
                            <span>{t('Size')}: <strong style={{ color: 'var(--text-primary)' }}>{req.size}</strong></span>
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
