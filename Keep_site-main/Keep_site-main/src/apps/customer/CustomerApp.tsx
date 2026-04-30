import React, { useState, useEffect } from 'react';
import { Shirt, Trash2, CheckCircle, PlusCircle, X, Layout, List } from 'lucide-react';
import { mockProducts } from '../../mock/products';
import { useRequests } from '../../hooks/useRequests';
import { ThemeToggle } from '../../components/ThemeToggle';
import { LanguageToggle } from '../../components/LanguageToggle';
import { useTranslation } from 'react-i18next';
import type { TaggedProduct } from '../../types/request';

/** 세션 ID를 가져오거나 신규 생성합니다 */
const getOrCreateSessionId = (): string => {
  const existing = localStorage.getItem('keep-session-id');
  if (existing) return existing;
  const newId = `session-${Math.random().toString(36).substring(2, 9)}`;
  localStorage.setItem('keep-session-id', newId);
  return newId;
};

export const CustomerApp = () => {
  const { t } = useTranslation();
  // useRequests hook — service 계층을 통해 요청 생성/조회
  const { createRequests } = useRequests();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [taggedItems, setTaggedItems] = useState<TaggedProduct[]>([]);
  const [assignedRoom, setAssignedRoom] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'carousel' | 'list'>('carousel');

  // Carousel State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Prevent scrolling when swiping vertically heavily in carousel
    if (viewMode === 'carousel' && dragOffset.y < -20) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [dragOffset.y, viewMode]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTagProduct = (productId: string) => {
    if (assignedRoom) setAssignedRoom(null);
    const product = mockProducts.find(p => p.id === productId);
    if (!product) return;

    setTaggedItems(prev => {
      const newArr = [...prev, {
        productId: product.id,
        productName: product.name,
        color: product.colors[0],
        size: product.sizes[0],
      }];
      if (viewMode === 'carousel') {
        setCurrentIndex(newArr.length - 1);
      }
      return newArr;
    });
    showToast(t('Product Tagged!'));
  };

  const updateTaggedItem = (index: number, key: 'color' | 'size', value: string) => {
    setTaggedItems(prev => prev.map((item, i) => i === index ? { ...item, [key]: value } : item));
  };

  const removeTaggedItem = (index: number) => {
    setTaggedItems(prev => {
      const newItems = prev.filter((_, i) => i !== index);
      if (currentIndex >= newItems.length && newItems.length > 0) {
        setCurrentIndex(newItems.length - 1);
      } else if (newItems.length === 0) {
        setCurrentIndex(0);
      }
      return newItems;
    });
  };

  const handleFittingRequest = async () => {
    if (taggedItems.length === 0) return;

    const sessionId = getOrCreateSessionId();

    // ⚠️ 백엔드 구조: 요청 1개 = 상품 1개
    // createRequests: 상품 배열 → 상품별 개별 API 요청 생성
    // 상품 3개 태깅 → POST /api/requests 3회 호출 (병렬)
    const results = await createRequests({
      products: [...taggedItems],
      fittingRoomId: '', // service에서 자동 배정
      status: 'pending',
      sessionId,
    });

    // 첫 번째 요청의 피팅룸을 UI에 표시
    const firstRoom = results[0]?.fittingRoomId ?? '';
    setAssignedRoom(firstRoom);
    setTaggedItems([]);
    setCurrentIndex(0);
    showToast(t('Fitting request submitted!'));
  };

  // Touch Handlers for Carousel
  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (viewMode !== 'carousel') return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setTouchStart({ x: clientX, y: clientY });
    setDragOffset({ x: 0, y: 0 });
  };
  
  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!touchStart || viewMode !== 'carousel') return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    setDragOffset({
      x: clientX - touchStart.x,
      y: clientY - touchStart.y
    });
  };

  const handleEnd = () => {
    if (!touchStart || viewMode !== 'carousel') return;
    
    if (dragOffset.y < -80 && Math.abs(dragOffset.y) > Math.abs(dragOffset.x)) {
      removeTaggedItem(currentIndex);
    } 
    else if (dragOffset.x > 60 && currentIndex > 0) {
      setCurrentIndex(curr => curr - 1);
    } 
    else if (dragOffset.x < -60 && currentIndex < taggedItems.length - 1) {
      setCurrentIndex(curr => curr + 1);
    }
    
    setTouchStart(null);
    setDragOffset({ x: 0, y: 0 });
  };

  return (
    <div className="app-container" style={{ padding: '1rem', paddingBottom: '100px' }}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">{t('KEEP')}</h1>
          <p className="text-xs text-muted mt-1">{t('NFC Tagging System')}</p>
        </div>
        <div className="flex gap-2 items-center">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>

      {assignedRoom && (
        <div className="card my-4 animate-slide-in" style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '2rem 1rem', textAlign: 'center', borderRadius: '1.5rem' }}>
          <CheckCircle size={48} style={{ margin: '0 auto', marginBottom: '16px' }} />
          <h2 className="text-2xl font-bold mb-2">{t('Fitting Room Assigned!')}</h2>
          <p className="text-lg">{t('Please go to Fitting Room')} <strong style={{ fontSize: '1.5em', margin: '0 0.2em' }}>{assignedRoom}</strong></p>
        </div>
      )}

      {!assignedRoom && (
        <div className="mb-4 text-center pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold mb-3 flex items-center justify-center gap-2 text-muted">
            <PlusCircle size={16} />
            {t('Mock NFC Tagging (Tap to simulate)')}
          </h2>
          <div className="mock-nfc-header justify-center" style={{ flexWrap: 'wrap' }}>
            {mockProducts.map(product => (
              <button 
                key={product.id}
                className="mock-nfc-chip"
                onClick={() => handleTagProduct(product.id)}
              >
                <PlusCircle size={16} color="var(--primary)" />
                {product.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Tagged Items Display */}
      {!assignedRoom && taggedItems.length > 0 && (
        <div className="animate-slide-in flex-col items-center w-full">
          
          {/* Header & View Toggle */}
          <div className="flex justify-between items-center w-full px-2 mb-2">
            <span className="text-muted text-sm font-medium">
              {t('Tagged Products')} ({taggedItems.length})
            </span>
            <div className="view-toggle">
              <button 
                className={viewMode === 'carousel' ? 'active' : ''} 
                onClick={() => setViewMode('carousel')}
              >
                <Layout size={16} />
              </button>
              <button 
                className={viewMode === 'list' ? 'active' : ''} 
                onClick={() => setViewMode('list')}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Carousel View */}
          {viewMode === 'carousel' && (
            <>
              <div 
                className="mobile-carousel-container"
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
                onMouseDown={handleStart}
                onMouseMove={touchStart ? handleMove : undefined}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
              >
                <div 
                  className="carousel-track"
                  style={{ 
                    transform: `translateX(calc(-${currentIndex * 82}% + 9% + ${dragOffset.x}px))`,
                    transition: touchStart ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
                  }}
                >
                  {taggedItems.map((item, idx) => {
                    const productDef = mockProducts.find(p => p.id === item.productId)!;
                    const isCurrent = idx === currentIndex;
                    const isSwipingUp = isCurrent && dragOffset.y < 0;
                    
                    return (
                      <div className="carousel-card-wrapper" key={`${item.productId}-${idx}`}>
                        <div 
                          className="toss-card" 
                          style={{
                            transform: isSwipingUp 
                              ? `translateY(${dragOffset.y}px) scale(${1 - Math.abs(dragOffset.y)/2000})` 
                              : (!isCurrent ? 'scale(0.88)' : 'scale(1)'),
                            opacity: isSwipingUp ? 1 - Math.abs(dragOffset.y)/300 : (!isCurrent ? 0.4 : 1),
                            transition: touchStart ? 'none' : 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
                          }}
                        >
                          <div className="toss-img-wrapper cursor-pointer">
                            <img src={productDef.imageUrl} alt={item.productName} draggable="false" />
                            <button 
                              className="toss-dismiss-hint" 
                              onClick={(e) => { e.stopPropagation(); removeTaggedItem(idx); }}
                            >
                              <X size={20} />
                            </button>
                            
                            {isCurrent && dragOffset.y < -30 && (
                              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,0,0,0.2)', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', backdropFilter: 'blur(2px)' }}>
                                <Trash2 size={32} />
                              </div>
                            )}
                          </div>
                          
                          <div className="toss-options" onClick={(e) => e.stopPropagation()}>
                            <div className="text-center">
                              <h3 className="text-lg font-bold">{item.productName}</h3>
                              <p className="text-xs text-muted mt-1">
                                {t('Swipe left/right to browse, up to dismiss')}
                              </p>
                            </div>
                            
                            <div className="text-center">
                              <div className="flex flex-wrap justify-center gap-1.5 mb-2">
                                {productDef.colors.map(c => (
                                  <button 
                                    key={c}
                                    onClick={() => updateTaggedItem(idx, 'color', c)}
                                    className={`option-btn ${item.color === c ? 'selected' : ''}`}
                                    style={{ padding: '0.4rem 0.8rem' }}
                                  >
                                    {c}
                                  </button>
                                ))}
                              </div>

                              <div className="flex flex-wrap justify-center gap-1.5">
                                {productDef.sizes.map(s => (
                                  <button 
                                    key={s}
                                    onClick={() => updateTaggedItem(idx, 'size', s)}
                                    className={`option-btn ${item.size === s ? 'selected' : ''}`}
                                    style={{ padding: '0.4rem 0.8rem' }}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="indicator-dots">
                {taggedItems.map((_, idx) => (
                  <div key={idx} className={`dot ${idx === currentIndex ? 'active' : ''}`} />
                ))}
              </div>
            </>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="list-view-container w-full">
              {taggedItems.map((item, idx) => {
                const productDef = mockProducts.find(p => p.id === item.productId)!;
                return (
                  <div key={`${item.productId}-${idx}`} className="list-card">
                    <img src={productDef.imageUrl} alt={item.productName} />
                    <div className="list-card-content">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold">{item.productName}</h3>
                        <button className="text-muted hover:text-red-500" onClick={() => removeTaggedItem(idx)}>
                          <X size={18} />
                        </button>
                      </div>
                      
                      <div className="flex flex-col gap-2 mt-1">
                        <div className="flex gap-1.5 flex-wrap">
                          {productDef.colors.map(c => (
                            <button 
                              key={c}
                              onClick={() => updateTaggedItem(idx, 'color', c)}
                              className={`option-btn ${item.color === c ? 'selected' : ''}`}
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          {productDef.sizes.map(s => (
                            <button 
                              key={s}
                              onClick={() => updateTaggedItem(idx, 'size', s)}
                              className={`option-btn ${item.size === s ? 'selected' : ''}`}
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Empty State */}
      {!assignedRoom && taggedItems.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center text-muted" style={{ minHeight: '400px' }}>
          <Shirt size={64} style={{ opacity: 0.2, marginBottom: '20px' }} />
          <p className="text-lg font-medium">{t('No products tagged yet.')}</p>
          <p className="text-sm mt-2">{t('Tap a product above to tag it.')}</p>
        </div>
      )}

      {/* Floating Action Bar */}
      {!assignedRoom && taggedItems.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'var(--bg-color)', borderTop: '1px solid var(--border)', zIndex: 10 }}>
          <button 
            className="btn btn-primary"
            style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', borderRadius: '1rem', fontWeight: 'bold' }}
            onClick={handleFittingRequest}
          >
            <Shirt size={20} /> {t('Confirm & Request Fitting')}
          </button>
        </div>
      )}

      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
