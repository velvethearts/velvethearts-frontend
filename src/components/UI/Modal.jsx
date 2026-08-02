import React, { useEffect, useRef } from 'react';
import { X } from '@phosphor-icons/react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  role = 'dialog',
  variant = 'center', // 'center' | 'bottom-drawer'
  className = ''
}) => {
  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  // Focus trap & Escape logic
  useEffect(() => {
    if (!isOpen) return;
    
    // Save current active element
    triggerRef.current = document.activeElement;
    
    // Set focus to modal container
    modalRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]'
        );
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus
      triggerRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="vh-modal-overlay" onClick={onClose}>
      <div
        ref={modalRef}
        role={role}
        aria-modal="true"
        aria-labelledby="vh-modal-title"
        tabIndex={-1}
        className={`vh-modal-card vh-modal-variant-${variant} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="vh-modal-header">
          {title && (
            <h2 id="vh-modal-title" className="vh-modal-title font-display">
              {title}
            </h2>
          )}
          <button 
            onClick={onClose} 
            className="vh-modal-close-btn" 
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </header>
        <div className="vh-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};
