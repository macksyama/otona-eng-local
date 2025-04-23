import React, { useState, useEffect } from 'react';

const { ipcRenderer } = window.require ? window.require('electron') : { ipcRenderer: null };

const API_TYPES = [
  { label: 'Perplexity', value: 'perplexity' },
  { label: 'OpenAI', value: 'openai' },
];

const DEFAULT_GOAL = 'ネイティブスピーカーと、時事問題に関してネイティブと同じように深い議論ができること。';

const Settings: React.FC = () => {
  const [apiType, setApiType] = useState<'perplexity' | 'openai'>('perplexity');
  const [goal, setGoal] = useState<string>(() => localStorage.getItem('learning-goal') || DEFAULT_GOAL);

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

  const handleGoalChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGoal(e.target.value);
    localStorage.setItem('learning-goal', e.target.value);
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
      <div style={{ marginTop: 32 }}>
        <h2>学習目標</h2>
        <textarea
          value={goal}
          onChange={handleGoalChange}
          rows={3}
          style={{ width: '100%', minHeight: 60, fontSize: 16, padding: 8 }}
          placeholder="例: ネイティブスピーカーと、時事問題に関してネイティブと同じように深い議論ができること。"
        />
      </div>
    </div>
  );
};

export default Settings; 