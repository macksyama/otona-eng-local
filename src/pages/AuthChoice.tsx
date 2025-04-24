import React from 'react';

interface AuthChoiceProps {
  onGoogleLogin: () => void;
  onGuest: () => void;
}

const AuthChoice: React.FC<AuthChoiceProps> = ({ onGoogleLogin, onGuest }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-80 flex flex-col gap-4">
        <h2 className="text-xl mb-4">ログイン方法を選択</h2>
        <button
          onClick={onGoogleLogin}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full mb-2 flex items-center justify-center gap-2"
        >
          <img src="/google-icon.png" alt="Google" className="w-5 h-5" />
          Googleでログイン
        </button>
        <button
          onClick={onGuest}
          className="bg-gray-400 text-white px-4 py-2 rounded w-full"
        >
          ログインせずに始める（ゲスト）
        </button>
      </div>
    </div>
  );
};

export default AuthChoice; 