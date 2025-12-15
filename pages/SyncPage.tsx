import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import { supabaseAdmin } from '../services/supabaseClient';
import { SERVICES_DATA, CONFIGURATOR_ITEMS } from '../constants';

interface SyncStatus {
  services: boolean | null;
  configuratorItems: boolean | null;
}

const SyncPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    services: null,
    configuratorItems: null,
  });
  const [syncMessage, setSyncMessage] = useState('');

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncMessage('Iniciando sincronización...');

    try {
      // Sync Services
      const { error: servicesError } = await supabaseAdmin
        .from('services')
        .upsert(SERVICES_DATA, { onConflict: 'id' });

      if (servicesError) throw new Error(`Services error: ${servicesError.message}`);
      setSyncStatus(prev => ({ ...prev, services: true }));
      setSyncMessage('✅ Servicios sincronizados');

      // Sync Configurator Items
      const { error: itemsError } = await supabaseAdmin
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
        </div>
      </div>
    </div>
  );
};

export default SyncPage;