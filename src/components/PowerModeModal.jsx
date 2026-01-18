import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

export function PowerModeModal({ visible, onHide, rowData, onSave }) {
  const [selectedMode, setSelectedMode] = useState(rowData?.powerMode || 'Daily');
  const [tempSelectedMode, setTempSelectedMode] = useState(rowData?.powerMode || 'Daily');
  
  const powerModes = [
    { value: 'Daily', label: 'Daily', icon: 'pi-sun', description: 'Active every day' },
    { value: 'Alt 1', label: 'Alt 1', icon: 'pi-calendar', description: 'Alternate schedule 1' },
    { value: 'Alt 2', label: 'Alt 2', icon: 'pi-calendar-plus', description: 'Alternate schedule 2' },
    { value: 'Weekday', label: 'Weekday', icon: 'pi-briefcase', description: 'Monday to Friday' },
    { value: 'Monthly', label: 'Monthly', icon: 'pi-calendar-times', description: 'Once per month' }
  ];

  const handleCancel = () => {
    setTempSelectedMode(selectedMode);
    onHide();
  };

  const handleApply = () => {
    setSelectedMode(tempSelectedMode);
    if (onSave) {
      onSave(tempSelectedMode);
    }
    onHide();
  };

  return (
    <Dialog
      header="Power Mode"
      visible={visible}
      style={{ width: '450px' }}
      modal
      dismissableMask
      onHide={handleCancel}
      footer={
        <div>
          <Button 
            label="Cancel" 
            icon="pi pi-times" 
            onClick={handleCancel} 
            className="p-button-text" 
          />
          <Button 
            label="Apply" 
            icon="pi pi-check" 
            onClick={handleApply} 
            autoFocus 
          />
        </div>
      }
    >
      <div style={{ padding: '1rem 0' }}>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-color-secondary)' }}>
          Select power mode schedule for <strong>{rowData?.location || 'this location'}</strong>
        </p>
        <div className="column-customize-list">
          {powerModes.map((mode) => (
            <div
              key={mode.value}
              className="column-item"
              onClick={() => setTempSelectedMode(mode.value)}
            >
              <div className="column-item-content">
                <i 
                  className={`pi ${mode.icon}`}
                  style={{ 
                    fontSize: '1.25rem',
                    color: tempSelectedMode === mode.value ? 'var(--primary-color)' : 'var(--text-color-secondary)'
                  }}
                ></i>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span className="column-label">{mode.label}</span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--text-color-secondary)',
                    fontWeight: '400'
                  }}>
                    {mode.description}
                  </span>
                </div>
              </div>
              <div className={`column-toggle ${tempSelectedMode === mode.value ? 'active' : ''}`}>
                <div className="column-toggle-thumb"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
