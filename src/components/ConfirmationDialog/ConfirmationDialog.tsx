import React from 'react';
import styles from './ConfirmationDialog.module.css';
import shared from '../../styles/shared.module.css';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
        
        <div className={styles.content}>
          <p className={styles.message}>{message}</p>
        </div>
        
        <div className={styles.actions}>
          <button 
            onClick={onCancel}
            className={`${shared.btn} ${shared.btnSecondary}`}
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className={`${shared.btn} ${shared.btnDanger}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};