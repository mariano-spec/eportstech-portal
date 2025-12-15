import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { SERVICES_DATA, CONFIGURATOR_ITEMS, TRANSLATIONS } from '../constants';

interface SyncStatus {
  services: boolean | null;
  configuratorItems: boolean | null;
  brandConfig: boolean | null;
  botConfig: boolean | null;
  notificationSettings: boolean | null;
}

const SyncPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    services: null,
    configuratorItems: null,
    brandConfig: null,
    botConfig: null,
    notificationSettings: null,
  });
  const [syncMessage, setSyncMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) {
        setLoginError('Credenciales inválidas.');
        return;
      }
      if (data.user) setIsAuthenticated(true);
    } catch (err) {
      setLoginError('Error al conectar con Supabase.');
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncMessage('Sincronizando...');
    
    try {
      await supabaseClient.from('services').upsert(SERVICES_DATA, { onConflict: 'id' });
      setSyncStatus(prev => ({ ...prev, services: true }));
      
      await supabaseClient.from('configurator_items').upsert(CONFIGURATOR_ITEMS, { onConflict: 'id' });
      setSyncStatus(prev => ({ ...prev, configuratorItems: true }));
      
      setSyncMessage('✅ Sincronización completada!');
    } catch (err) {
      setSyncMessage('❌ Error en sincronización');
    }
    
    setIsSyncing(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
          <Lock size={32} className="text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">EportsTech Sync</h1>
          <p className="text-gray-600 text-center mb-6">Panel de sincronización</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sync@eportstech.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
            {loginError && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-sm text-red-700">{loginError}</p></div>}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg">Iniciar Sesión</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Sincronización de Datos</h1>
          
          {syncMessage && <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"><p className="text-sm text-blue-800">{syncMessage}</p></div>}

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div><h3 className="font-semibold">Servicios</h3><p className="text-sm text-gray-600">{SERVICES_DATA.length} servicios</p></div>
              {syncStatus.services === true && <CheckCircle size={24} className="text-green-600" />}
              {syncStatus.services === false && <AlertTriangle size={24} className="text-red-600" />}
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div><h3 className="font-semibold">Items Configurador</h3><p className="text-sm text-gray-600">{CONFIGURATOR_ITEMS.length} items</p></div>
              {syncStatus.configuratorItems === true && <CheckCircle size={24} className="text-green-600" />}
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div><h3 className="font-semibold">Brand Config</h3><p className="text-sm text-gray-600">Textos y logos</p></div>
              {syncStatus.brandConfig === true && <CheckCircle size={24} className="text-green-600" />}
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div><h3 className="font-semibold">Bot Config</h3><p className="text-sm text-gray-600">Configuración IA</p></div>
              {syncStatus.botConfig === true && <CheckCircle size={24} className="text-green-600" />}
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div><h3 className="font-semibold">Notificaciones</h3><p className="text-sm text-gray-600">Emails y alertas</p></div>
              {syncStatus.notificationSettings === true && <CheckCircle size={24} className="text-green-600" />}
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={handleSyncAll} disabled={isSyncing} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
              {isSyncing && <Loader size={20} className="animate-spin" />}
              {isSyncing ? 'Sincronizando...' : 'Sincronizar Todo'}
            </button>
            <button onClick={() => navigate('/admin')} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg">Admin</button>
          </div>

          <button onClick={() => setIsAuthenticated(false)} className="w-full mt-4 text-gray-600 hover:text-gray-800 py-2">Logout</button>
        </div>
      </div>
    </div>
  );
};

export default SyncPage;