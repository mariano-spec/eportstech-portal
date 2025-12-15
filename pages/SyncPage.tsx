import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertTriangle, Loader, RefreshCw } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { SERVICES_DATA, CONFIGURATOR_ITEMS } from '../constants';

interface SyncStatus {
  services: boolean | null;
  configuratorItems: boolean | null;
}

const SyncPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    services: null,
    configuratorItems: null,
  });
  const [syncMessage, setSyncMessage] = useState('');
  const [syncStats, setSyncStats] = useState({ services: 0, items: 0 });

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncMessage('🔄 Iniciando sincronización...');
    setSyncStatus({ services: null, configuratorItems: null });

    try {
      console.log('📊 === SINCRONIZACIÓN INICIADA ===');
      console.log('📤 Datos a sincronizar:');
      console.log('Services:', SERVICES_DATA.length, 'items');
      console.log('Configurator Items:', CONFIGURATOR_ITEMS.length, 'items');

      // === SYNC SERVICES ===
      console.log('\n📤 [1/2] Sincronizando SERVICIOS...');
      const { error: servicesError, data: servicesData } = await supabase
        .from('services')
        .upsert(SERVICES_DATA, { onConflict: 'id' })
        .select();

      if (servicesError) {
        console.error('❌ Services error:', servicesError);
        throw new Error(`Services: ${servicesError.message}`);
      }

      console.log('✅ Services sincronizados:', servicesData?.length || SERVICES_DATA.length);
      setSyncStatus(prev => ({ ...prev, services: true }));
      setSyncStats(prev => ({ ...prev, services: servicesData?.length || SERVICES_DATA.length }));
      setSyncMessage('✅ Servicios sincronizados correctamente');

      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // === SYNC CONFIGURATOR ITEMS ===
      console.log('\n📤 [2/2] Sincronizando CONFIGURATOR ITEMS...');
      const { error: itemsError, data: itemsData } = await supabase
        .from('configurator_items')
        .upsert(CONFIGURATOR_ITEMS, { onConflict: 'id' })
        .select();

      if (itemsError) {
        console.error('❌ Items error:', itemsError);
        throw new Error(`Items: ${itemsError.message}`);
      }

      console.log('✅ Items sincronizados:', itemsData?.length || CONFIGURATOR_ITEMS.length);
      setSyncStatus(prev => ({ ...prev, configuratorItems: true }));
      setSyncStats(prev => ({ ...prev, items: itemsData?.length || CONFIGURATOR_ITEMS.length }));
      setSyncMessage('✅ ¡Sincronización completada exitosamente!');
      
      console.log('\n✅ === SINCRONIZACIÓN COMPLETADA ===\n');

      // Navigate after 2 seconds
      setTimeout(() => navigate('/admin'), 2000);
    } catch (err) {
      console.error('❌ Sync error:', err);
      setSyncMessage(
        `❌ Error: ${err instanceof Error ? err.message : 'Error desconocido'}`
      );
      setSyncStatus({ services: false, configuratorItems: false });
    }

    setIsSyncing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 border border-slate-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <RefreshCw className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-slate-900">Sincronización</h1>
            </div>
            <p className="text-slate-600">Carga los datos de la aplicación a Supabase</p>
          </div>

          {/* Status Message */}
          {syncMessage && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                syncMessage.includes('❌')
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : syncMessage.includes('✅')
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              <p className="font-medium">{syncMessage}</p>
            </div>
          )}

          {/* Data to Sync */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <h3 className="font-semibold text-slate-900">Servicios</h3>
                <p className="text-sm text-slate-600">
                  {SERVICES_DATA.length} servicios a sincronizar
                </p>
              </div>
              <div className="flex items-center gap-2">
                {syncStatus.services === true && (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">
                      {syncStats.services} ✓
                    </span>
                  </>
                )}
                {syncStatus.services === false && (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <h3 className="font-semibold text-slate-900">Items del Configurador</h3>
                <p className="text-sm text-slate-600">
                  {CONFIGURATOR_ITEMS.length} items a sincronizar
                </p>
              </div>
              <div className="flex items-center gap-2">
                {syncStatus.configuratorItems === true && (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">
                      {syncStats.items} ✓
                    </span>
                  </>
                )}
                {syncStatus.configuratorItems === false && (
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSyncAll}
              disabled={isSyncing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              {isSyncing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Sincronizar Todo
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/admin')}
              disabled={isSyncing}
              className="flex-1 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 text-slate-800 font-semibold py-3 rounded-lg transition"
            >
              Ir al Admin
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>ℹ️ Nota:</strong> Esta página sincroniza los datos de la aplicación a la base de datos Supabase. 
              Los datos ya existentes se actualizarán automáticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncPage;
