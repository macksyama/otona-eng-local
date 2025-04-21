import React, { useState, useEffect } from 'react';

const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

const API_TYPES = [
  { label: 'Perplexity', value: 'perplexity' },
  { label: 'OpenAI', value: 'openai' },
];

const Settings: React.FC = () => {
  const [apiType, setApiType] = useState<'perplexity' | 'openai'>('perplexity');

  useEffect(() => {
    // 初期値をメインプロセスに通知
    if (ipcRenderer) {
      ipcRenderer.invoke('set-api-type', apiType);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as 'perplexity' | 'openai';
    setApiType(value);
    if (ipcRenderer) {
      ipcRenderer.invoke('set-api-type', value);
    }
  };

  return (
    <div style={{ padding: 24, paddingTop: 72 }}>
      <h2>API設定</h2>
      <div>
        {API_TYPES.map((type) => (
          <label key={type.value} style={{ marginRight: 16 }}>
            <input
              type="radio"
              name="apiType"
              value={type.value}
              checked={apiType === type.value}
              onChange={handleChange}
            />
            {type.label}
          </label>
        ))}
      </div>
    </div>
  );
};

export default Settings; 