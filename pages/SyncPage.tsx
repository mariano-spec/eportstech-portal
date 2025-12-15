import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import { supabaseAdmin } from '../services/supabaseClient';
import { SERVICES_DATA, CONFIGURATOR_ITEMS } from '../constants';

interface SyncStatus {
  services: boolean | null;
  configuratorItems: boolean | null;
}

const SyncPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    services: null,
    configuratorItems: null,
  });
  const [syncMessage, setSyncMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoginError('Email o contraseña incorrectos.');
        console.error('Auth error:', error);
        return;
      }

      if (data.user) {
        setIsAuthenticated(true);
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setLoginError('Error de conexión con Supabase.');
      console.error('Login exception:', err);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncMessage('Iniciando sincronización...');

    try {
      // Sync Services
      const { error: servicesError } = await supabase
        .from('services')
        .upsert(SERVICES_DATA, { onConflict: 'id' });

      if (servicesError) throw new Error(`Services error: ${servicesError.message}`);
      setSyncStatus(prev => ({ ...prev, services: true }));
      setSyncMessage('✅ Servicios sincronizados');

      // Sync Configurator Items
      const { error: itemsError } = await supabase
        .from('configurator_items')
        .upsert(CONFIGURATOR_ITEMS, { onConflict: 'id' });

      if (itemsError) throw new Error(`Items error: ${itemsError.message}`);
      setSyncStatus(prev => ({ ...prev, configuratorItems: true }));
      setSyncMessage('✅ ¡Sincronización completada!');
    } catch (err) {
      console.error('Sync error:', err);
      setSyncMessage(`❌ Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      setSyncStatus(prev => ({
        ...prev,
        services: false,
        configuratorItems: false,
      }));
    }

    setIsSyncing(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-6">
            <Lock size={40} className="text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Panel de Sincronización</h1>
            <p className="text-gray-600 text-sm">EportsTech - Administración</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sync@eportstech.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Iniciar Sesión
            </button>
          </form>


        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sincronización de Datos</h1>
          <p className="text-gray-600 mb-8">Carga los datos de la aplicación a Supabase</p>

          {syncMessage && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">{syncMessage}</p>
            </div>
          )}

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div>
                <h3 className="font-semibold text-gray-800">Servicios</h3>
                <p className="text-sm text-gray-600">{SERVICES_DATA.length} servicios a sincronizar</p>
              </div>
              {syncStatus.services === true && <CheckCircle size={24} className="text-green-600" />}
              {syncStatus.services === false && <AlertTriangle size={24} className="text-red-600" />}
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div>
                <h3 className="font-semibold text-gray-800">Items del Configurador</h3>
                <p className="text-sm text-gray-600">{CONFIGURATOR_ITEMS.length} items a sincronizar</p>
              </div>
              {syncStatus.configuratorItems === true && <CheckCircle size={24} className="text-green-600" />}
              {syncStatus.configuratorItems === false && <AlertTriangle size={24} className="text-red-600" />}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {isSyncing && <Loader size={20} className="animate-spin" />}
              {isSyncing ? 'Sincronizando...' : 'Sincronizar Todo'}
            </button>

            <button
              onClick={() => navigate('/admin')}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
            >
              Ir al Admin
            </button>
          </div>

          <button
            onClick={() => {
              setIsAuthenticated(false);
              setEmail('');
              setPassword('');
            }}
            className="w-full mt-4 text-gray-600 hover:text-gray-800 py-2 text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default SyncPage;