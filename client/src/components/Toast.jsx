import { Toaster } from 'react-hot-toast';

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      containerStyle={{ top: 20, right: 20 }}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgba(30, 41, 59, 0.92)',
          backdropFilter: 'blur(16px)',
          color: '#f1f5f9',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          borderRadius: '16px',
          padding: '14px 20px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow:
            '0 20px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.2)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#f1f5f9',
          },
        },
        error: {
          iconTheme: {
            primary: '#f43f5e',
            secondary: '#f1f5f9',
          },
          duration: 5000,
        },
        loading: {
          iconTheme: {
            primary: '#6366f1',
            secondary: '#f1f5f9',
          },
        },
      }}
    />
  );
}
