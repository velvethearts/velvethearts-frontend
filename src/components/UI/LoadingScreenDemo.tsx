import React, { useState } from 'react';
import { LoadingScreen } from './LoadingScreen';

/**
 * LoadingScreenDemo: Interactive Playground & Verification Harness
 * for previewing and testing all states of <LoadingScreen />.
 */
export const LoadingScreenDemo: React.FC = () => {
  const [activePreset, setActivePreset] = useState<'none' | 'normal' | 'long' | 'fast' | 'custom'>('none');
  const [fullscreen, setFullscreen] = useState<boolean>(true);
  const [variant, setVariant] = useState<'overlay' | 'card' | 'minimal'>('overlay');
  const [messageInterval, setMessageInterval] = useState<number>(2000);
  const [longWaitThreshold, setLongWaitThreshold] = useState<number>(8000);
  const [customMessages, setCustomMessages] = useState<string>([
    'Curating your matches…',
    'Analyzing shared passions…',
    'Polishing your story deck…',
    'Setting up your private salon…'
  ].join('\n'));

  // Trigger handlers
  const handleStartNormal = () => {
    setActivePreset('normal');
    // Auto-dismiss after 6.5s to test real flow completion
    setTimeout(() => {
      setActivePreset((prev) => (prev === 'normal' ? 'none' : prev));
    }, 6500);
  };

  const handleStartLong = () => {
    setActivePreset('long');
  };

  const handleStartFast = () => {
    setActivePreset('fast');
    setTimeout(() => {
      setActivePreset((prev) => (prev === 'fast' ? 'none' : prev));
    }, 1500);
  };

  const handleStartCustom = () => {
    setActivePreset('custom');
  };

  const parsedCustomMessages = customMessages
    .split('\n')
    .map((m) => m.trim())
    .filter(Boolean);

  return (
    <div style={{
      maxWidth: 800,
      margin: '40px auto',
      padding: '32px 24px',
      background: 'linear-gradient(135deg, #1A1517 0%, #2A0812 100%)',
      borderRadius: '24px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
      color: '#FAF8F9',
      fontFamily: 'Outfit, sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.75rem', fontFamily: 'DM Serif Display, Georgia, serif', color: '#F0A0AD' }}>
            Loading Screen Showcase
          </h2>
          <p style={{ margin: '6px 0 0 0', color: '#D1C9CB', fontSize: '0.9rem' }}>
            Interactive test harness for verifying the heart loader, animations, and timeout fallbacks.
          </p>
        </div>
        <span style={{
          padding: '4px 12px',
          borderRadius: 999,
          background: 'rgba(184, 67, 106, 0.2)',
          color: '#E4C88E',
          fontSize: '0.8rem',
          border: '1px solid rgba(184,67,106,0.4)',
          fontWeight: 600
        }}>
          Branch: feature/heart-loading-screen
        </span>
      </div>

      {/* Preset Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <button
          type="button"
          onClick={handleStartNormal}
          style={{
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #B8436A, #7A2842)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(184, 67, 106, 0.3)'
          }}
        >
          ▶ Test Standard Load (6.5s)
        </button>

        <button
          type="button"
          onClick={handleStartFast}
          style={{
            padding: '12px 20px',
            background: 'rgba(255,255,255,0.1)',
            color: '#FAF8F9',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          ⚡ Fast Operation (1.5s)
        </button>

        <button
          type="button"
          onClick={handleStartLong}
          style={{
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #C4964A, #9B3456)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(196, 150, 74, 0.3)'
          }}
        >
          ⏳ Test Long Wait Timeout (&gt;8s)
        </button>

        <button
          type="button"
          onClick={handleStartCustom}
          style={{
            padding: '12px 20px',
            background: 'rgba(224, 122, 138, 0.15)',
            color: '#F0BDC8',
            border: '1px solid rgba(224, 122, 138, 0.35)',
            borderRadius: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          ✨ Custom Messages
        </button>

        {activePreset !== 'none' && (
          <button
            type="button"
            onClick={() => setActivePreset('none')}
            style={{
              padding: '12px 20px',
              background: '#C45A5A',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ⏹ Stop Loader
          </button>
        )}
      </div>

      {/* Configuration Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        background: 'rgba(0, 0, 0, 0.25)',
        padding: 20,
        borderRadius: 16,
        marginBottom: 28
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#D1C9CB', marginBottom: 6 }}>
            Mode Layout:
          </label>
          <select
            value={fullscreen ? 'fullscreen' : 'inline'}
            onChange={(e) => setFullscreen(e.target.value === 'fullscreen')}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              background: '#2C2426',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)'
            }}
          >
            <option value="fullscreen">Fullscreen Overlay (Fixed)</option>
            <option value="inline">Inline Container Mode</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#D1C9CB', marginBottom: 6 }}>
            Style Variant:
          </label>
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value as any)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 8,
              background: '#2C2426',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)'
            }}
          >
            <option value="overlay">Frosted Overlay</option>
            <option value="card">Velvet Card</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#D1C9CB', marginBottom: 6 }}>
            Cycle Interval ({messageInterval}ms):
          </label>
          <input
            type="range"
            min={1500}
            max={3500}
            step={100}
            value={messageInterval}
            onChange={(e) => setMessageInterval(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#D1C9CB', marginBottom: 6 }}>
            Timeout Threshold ({longWaitThreshold / 1000}s):
          </label>
          <input
            type="range"
            min={3000}
            max={15000}
            step={1000}
            value={longWaitThreshold}
            onChange={(e) => setLongWaitThreshold(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Custom Messages Textarea */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#D1C9CB', marginBottom: 6 }}>
          Custom Status Messages (One per line):
        </label>
        <textarea
          rows={4}
          value={customMessages}
          onChange={(e) => setCustomMessages(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 8,
            background: '#2C2426',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)',
            fontFamily: 'inherit',
            fontSize: '0.9rem',
            resize: 'vertical',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Inline Preview Container if not in fullscreen mode */}
      {!fullscreen && (
        <div style={{
          marginTop: 24,
          border: '2px dashed rgba(184, 67, 106, 0.4)',
          borderRadius: 16,
          padding: 12,
          background: 'rgba(0,0,0,0.3)',
          minHeight: 320,
          position: 'relative'
        }}>
          <div style={{ fontSize: '0.8rem', color: '#B5ABAD', marginBottom: 8 }}>
            Inline Sandbox Area:
          </div>
          {activePreset !== 'none' ? (
            <LoadingScreen
              isLoading={true}
              fullscreen={false}
              variant={variant}
              messageInterval={messageInterval}
              longWaitThreshold={activePreset === 'long' ? 4000 : longWaitThreshold}
              messages={activePreset === 'custom' ? parsedCustomMessages : undefined}
              onRetry={() => {
                alert('Retry clicked!');
                setActivePreset('none');
              }}
              onCancel={() => setActivePreset('none')}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260, color: '#7A6E70' }}>
              Click any button above to render the inline loader here.
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Overlay Render */}
      {fullscreen && activePreset !== 'none' && (
        <LoadingScreen
          isLoading={true}
          fullscreen={true}
          variant={variant}
          messageInterval={messageInterval}
          longWaitThreshold={activePreset === 'long' ? 4000 : longWaitThreshold}
          messages={activePreset === 'custom' ? parsedCustomMessages : undefined}
          onRetry={() => {
            alert('Retry triggered from timeout state!');
            setActivePreset('none');
          }}
          onCancel={() => setActivePreset('none')}
        />
      )}
    </div>
  );
};

export default LoadingScreenDemo;
