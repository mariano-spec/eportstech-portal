import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getServices, updateServices, getConfiguratorItems, saveConfiguratorItem, deleteConfiguratorItem, updateConfiguratorItemsOrder,
  getBotConfig, updateBotConfig
} from '../services/supabaseMock';
import { Service, ConfiguratorItem, ServiceCategory, BotConfig } from '../types';
import { SERVICES_DATA, CONFIGURATOR_ITEMS } from '../constants';
import { ChevronUp, ChevronDown, Trash2, Plus, Save, X, LogOut } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [configuratorItems, setConfiguratorItems] = useState<ConfiguratorItem[]>([]);
  const [botConfig, setBotConfig] = useState<BotConfig | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingItem, setEditingItem] = useState<ConfiguratorItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        console.log('📤 Loading admin data...');
        const srvs = await getServices();
        const items = await getConfiguratorItems();
        const bot = await getBotConfig();
        
        console.log('✅ Services loaded:', srvs.length);
        console.log('✅ Items loaded:', items.length);
        
        setServices(srvs);
        setConfiguratorItems(items);
        setBotConfig(bot);
      } catch (error) {
        console.error('Error loading data:', error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // === SERVICE HANDLERS ===
  const toggleServiceVisibility = async (service: Service) => {
    const updatedService = { ...service, visible: !service.visible };
    await updateServices([updatedService]);
    setServices(prev => prev.map(s => s.id === service.id ? updatedService : s));
    showSuccess('Servicio actualizado');
  };

  const moveService = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === services.length - 1)) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newServices = [...services];
    [newServices[index], newServices[newIndex]] = [newServices[newIndex], newServices[index]];
    
    newServices.forEach((s, idx) => s.sort_order = idx);
    
    setServices(newServices);
    await updateServices(newServices);
    showSuccess('Orden actualizado');
  };

  const deleteService = async (id: string) => {
    if (!confirm('¿Eliminar este servicio?')) return;
    // Note: Would need deleteService function in supabaseMock
    setServices(prev => prev.filter(s => s.id !== id));
    showSuccess('Servicio eliminado');
  };

  // === CONFIGURATOR ITEM HANDLERS ===
  const handleAddNewItem = () => {
    setEditingItem({
      id: Date.now().toString(),
      icon: 'Box',
      category: ServiceCategory.CONSULTING,
      title: { es: 'Nuevo Servicio', ca: '', en: '', fr: '', de: '', it: '' },
      benefit: { es: 'Beneficio', ca: '', en: '', fr: '', de: '', it: '' },
      visible: true,
      sort_order: configuratorItems.length
    });
  };

  const toggleItemVisibility = async (item: ConfiguratorItem) => {
    const updatedItem = { ...item, visible: !item.visible };
    await saveConfiguratorItem(updatedItem);
    setConfiguratorItems(prev => prev.map(i => i.id === item.id ? updatedItem : i));
    showSuccess('Item actualizado');
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === configuratorItems.length - 1)) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...configuratorItems];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    
    newItems.forEach((item, idx) => item.sort_order = idx);

    setConfiguratorItems(newItems);
    await updateConfiguratorItemsOrder(newItems);
    showSuccess('Orden actualizado');
  };

  const saveItem = async () => {
    if (!editingItem) return;
    await saveConfiguratorItem(editingItem);
    setConfiguratorItems(prev => {
      const exists = prev.some(i => i.id === editingItem.id);
      return exists ? prev.map(i => i.id === editingItem.id ? editingItem : i) : [...prev, editingItem];
    });
    setEditingItem(null);
    showSuccess('Item guardado');
  };

  const deleteItem = async (id: string) => {
    if (!confirm('¿Eliminar este item?')) return;
    await deleteConfiguratorItem(id);
    setConfiguratorItems(prev => prev.filter(i => i.id !== id));
    showSuccess('Item eliminado');
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleLogout = () => {
    navigate('/');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <LogOut size={20} />
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* SERVICES SECTION */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Servicios</h2>
          <div className="space-y-2">
            {services.map((service, idx) => (
              <div key={service.id} className="flex items-center gap-2 bg-white p-4 rounded-lg shadow-sm">
                <span className="text-sm font-semibold text-gray-500">{idx + 1}</span>
                <div className="flex-1">
                  <h4 className="font-semibold">{service.title.es}</h4>
                  <p className="text-sm text-gray-600">{service.description.es}</p>
                </div>
                <button
                  onClick={() => toggleServiceVisibility(service)}
                  className={`px-3 py-1 rounded text-sm ${service.visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                >
                  {service.visible ? 'Visible' : 'Oculto'}
                </button>
                <button
                  onClick={() => moveService(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 hover:bg-gray-200 disabled:opacity-50"
                >
                  <ChevronUp size={20} />
                </button>
                <button
                  onClick={() => moveService(idx, 'down')}
                  disabled={idx === services.length - 1}
                  className="p-1 hover:bg-gray-200 disabled:opacity-50"
                >
                  <ChevronDown size={20} />
                </button>
                <button
                  onClick={() => deleteService(service.id)}
                  className="p-1 hover:bg-red-100 text-red-600"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* CONFIGURATOR ITEMS SECTION */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Items del Configurador</h2>
            <button
              onClick={handleAddNewItem}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Nuevo Item
            </button>
          </div>
          <div className="space-y-2">
            {configuratorItems.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-2 bg-white p-4 rounded-lg shadow-sm">
                <span className="text-sm font-semibold text-gray-500">{idx + 1}</span>
                <div className="flex-1">
                  <h4 className="font-semibold">{item.title.es}</h4>
                  <p className="text-sm text-gray-600">{item.benefit.es}</p>
                </div>
                <button
                  onClick={() => toggleItemVisibility(item)}
                  className={`px-3 py-1 rounded text-sm ${item.visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                >
                  {item.visible ? 'Visible' : 'Oculto'}
                </button>
                <button
                  onClick={() => moveItem(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 hover:bg-gray-200 disabled:opacity-50"
                >
                  <ChevronUp size={20} />
                </button>
                <button
                  onClick={() => moveItem(idx, 'down')}
                  disabled={idx === configuratorItems.length - 1}
                  className="p-1 hover:bg-gray-200 disabled:opacity-50"
                >
                  <ChevronDown size={20} />
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-1 hover:bg-red-100 text-red-600"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ITEM EDITOR MODAL */}
        {editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Editar Item</h3>
                <button onClick={() => setEditingItem(null)}>
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Título ES"
                  value={editingItem.title.es || ''}
                  onChange={(e) => setEditingItem({...editingItem, title: {...editingItem.title, es: e.target.value}})}
                  className="w-full border p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Beneficio ES"
                  value={editingItem.benefit.es || ''}
                  onChange={(e) => setEditingItem({...editingItem, benefit: {...editingItem.benefit, es: e.target.value}})}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={saveItem}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Save size={20} />
                  Guardar
                </button>
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
