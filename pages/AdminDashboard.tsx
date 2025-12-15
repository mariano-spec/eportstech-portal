import React, { useState, useEffect } from 'react';
import { 
  loginMock, logoutMock, checkAuth, getBrandConfig, updateBrandConfig, 
  getConfiguratorLeads, getNotificationSettings, updateNotificationSettings,
  getServices, updateServices, getConfiguratorItems, saveConfiguratorItem, deleteConfiguratorItem, updateConfiguratorItemsOrder,
  getCustomSections, getBotConfig, updateBotConfig
} from '../services/supabaseMock';
import { 
  FileText, Settings, LogOut, Users, Database, Image as ImageIcon, Upload, Save, 
  LayoutDashboard, ShoppingBag, Bell, Plus, Trash2, Edit2, CheckCircle, Languages, Monitor,
  AlignLeft, Move, MapPin, Phone, X, AlertTriangle, Clock, Zap, MessageSquare, BrainCircuit, Mic,
  Eye, EyeOff, ArrowUp, ArrowDown, BookOpen, Mail, Star, Globe, Lock
} from 'lucide-react';
import { LeadForm, BrandConfig, ConfiguratorLead, NotificationSettings, Service, ConfiguratorItem, Language, DynamicSection, ServiceCategory, BotConfig } from '../types';
import { SUPPORTED_LANGUAGES } from '../constants';

const AdminDashboard: React.FC = () => {
  const [isAuthenticated] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [activeTab, setActiveTab] = useState('leads');
  const [mockLeads, setMockLeads] = useState<LeadForm[]>([]);
  const [configuratorLeads, setConfiguratorLeads] = useState<ConfiguratorLead[]>([]);
  
  // Brand Kit State
  const [brandConfig, setBrandConfig] = useState<BrandConfig>({
      siteName: 'EportsTech',
      favicon: '',
      navLogo: '/logo-blue.png',
      footerLogo: '/logo-white.png',
      contactEmail: 'contact@eportstech.com',
      contactPhone: '+34 900 123 456',
      hero: {
          image: '/hq-background.jpg',
          imagePosition: 'center',
          overlayOpacity: 0.6,
          title: { es: '', ca: '', en: '', fr: '', de: '', it: '' },
          subtitle: { es: '', ca: '', en: '', fr: '', de: '', it: '' },
          ctaText: { es: '', ca: '', en: '', fr: '', de: '', it: '' }
      },
      benefits: {
         mainTitle: { es: '', ca: '', en: '', fr: '', de: '', it: '' },
         subtitle: { es: '', ca: '', en: '', fr: '', de: '', it: '' },
         items: []
      },
      footer: {
         copyrightText: { es: '', ca: '', en: '', fr: '', de: '', it: '' },
         privacyText: { es: '', ca: '', en: '', fr: '', de: '', it: '' },
         legalText: { es: '', ca: '', en: '', fr: '', de: '', it: '' },
         cookiesText: { es: '', ca: '', en: '', fr: '', de: '', it: '' }
      }
  });
  
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [heroEditLang, setHeroEditLang] = useState<Language>('es');

  // Configurator Items State
  const [configuratorItems, setConfiguratorItems] = useState<ConfiguratorItem[]>([]);
  const [editingItem, setEditingItem] = useState<ConfiguratorItem | null>(null);
  const [isEditingItemModalOpen, setIsEditingItemModalOpen] = useState(false);

  // Bot Config State
  const [botConfig, setBotConfig] = useState<BotConfig | null>(null);
  const [newLimitation, setNewLimitation] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newKnowledgeItem, setNewKnowledgeItem] = useState('');

  // Settings State
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
      emailRecipients: [],
      notifyOnLead: true,
      notifyOnConfigurator: true
  });
  const [newEmail, setNewEmail] = useState('');

  // Services State
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [featuresText, setFeaturesText] = useState('');

  // Sections State
  const [customSections, setCustomSections] = useState<DynamicSection[]>([]);

  useEffect(() => {
    const init = async () => {
       const auth = await checkAuth();
       if (auth) {
           loadAllData();
       }
    };
    init();
  }, [isAuthenticated]);

  const loadAllData = async () => {
    try {
      console.log('📤 Loading all admin data...');
      
      // Load brand config - wrapped in try/catch
      try {
        const config = await getBrandConfig();
        console.log('✅ Brand config loaded');
        setBrandConfig(config);
      } catch (error) {
        console.warn('⚠️ Could not load brand config, using defaults');
      }

      // Load services
      const srvs = await getServices();
      console.log('✅ Services loaded:', srvs.length);
      setServices(srvs);

      // Load configurator items
      const items = await getConfiguratorItems();
      console.log('✅ Items loaded:', items.length);
      setConfiguratorItems(items);

      // Load bot config
      const bot = await getBotConfig();
      console.log('✅ Bot config loaded');
      setBotConfig(bot);

      // Load notification settings
      const notif = await getNotificationSettings();
      setNotificationSettings(notif);

    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // === SERVICES HANDLERS ===
  const toggleServiceVisibility = async (index: number) => {
    const updatedService = { ...services[index], visible: !services[index].visible };
    const newServices = services.map((s, i) => i === index ? updatedService : s);
    setServices(newServices);
    await updateServices(newServices);
  };

  const moveService = async (index: number, direction: 'up' | 'down') => {
      if ((direction === 'up' && index === 0) || (direction === 'down' && index === services.length - 1)) return;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      const newServices = [...services];
      [newServices[index], newServices[newIndex]] = [newServices[newIndex], newServices[index]];
      
      newServices.forEach((s, idx) => s.sort_order = idx);
      
      setServices(newServices);
      await updateServices(newServices);
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
      setIsEditingItemModalOpen(true);
  };

  const toggleItemVisibility = async (item: ConfiguratorItem) => {
      const updatedItem = { ...item, visible: !item.visible };
      await saveConfiguratorItem(updatedItem);
      setConfiguratorItems(prev => prev.map(i => i.id === item.id ? updatedItem : i));
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === configuratorItems.length - 1)) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...configuratorItems];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    
    newItems.forEach((item, idx) => item.sort_order = idx);

    setConfiguratorItems(newItems);
    await updateConfiguratorItemsOrder(newItems);
  };

  const saveItem = async () => {
    if (!editingItem) return;
    await saveConfiguratorItem(editingItem);
    setConfiguratorItems(prev => {
      const exists = prev.some(i => i.id === editingItem.id);
      return exists ? prev.map(i => i.id === editingItem.id ? editingItem : i) : [...prev, editingItem];
    });
    setEditingItem(null);
    setIsEditingItemModalOpen(false);
  };

  const deleteItem = async (id: string) => {
    if (!confirm('¿Eliminar este item?')) return;
    await deleteConfiguratorItem(id);
    setConfiguratorItems(prev => prev.filter(i => i.id !== id));
  };

  // === BRAND CONFIG HANDLERS ===
  const handleSaveBrandConfig = async () => {
    setIsSavingBrand(true);
    try {
      await updateBrandConfig(brandConfig, pendingFiles);
      setPendingFiles({});
      alert('✅ Brand config guardado');
    } catch (error) {
      alert('❌ Error al guardar');
    }
    setIsSavingBrand(false);
  };

  // === BOT CONFIG HANDLERS ===
  const saveBotConfig = async () => {
    if (!botConfig) return;
    try {
      await updateBotConfig(botConfig);
      alert('✅ Bot config guardado');
    } catch (error) {
      alert('❌ Error al guardar bot config');
    }
  };

  const addLimitation = () => {
    if (!newLimitation.trim() || !botConfig) return;
    setBotConfig({
      ...botConfig,
      limitations: [...botConfig.limitations, newLimitation]
    });
    setNewLimitation('');
  };

  const removeLimitation = (index: number) => {
    if (!botConfig) return;
    setBotConfig({
      ...botConfig,
      limitations: botConfig.limitations.filter((_, i) => i !== index)
    });
  };

  const addQuestion = () => {
    if (!newQuestion.trim() || !botConfig) return;
    setBotConfig({
      ...botConfig,
      qualifyingQuestions: [...botConfig.qualifyingQuestions, newQuestion]
    });
    setNewQuestion('');
  };

  const removeQuestion = (index: number) => {
    if (!botConfig) return;
    setBotConfig({
      ...botConfig,
      qualifyingQuestions: botConfig.qualifyingQuestions.filter((_, i) => i !== index)
    });
  };

  // === NOTIFICATIONS HANDLERS ===
  const saveNotificationSettings = async () => {
    try {
      await updateNotificationSettings(notificationSettings);
      alert('✅ Notification settings guardado');
    } catch (error) {
      alert('❌ Error al guardar');
    }
  };

  const addEmailRecipient = () => {
    if (!newEmail.trim() || !newEmail.includes('@')) return;
    setNotificationSettings({
      ...notificationSettings,
      emailRecipients: [...notificationSettings.emailRecipients, newEmail]
    });
    setNewEmail('');
  };

  const removeEmailRecipient = (email: string) => {
    setNotificationSettings({
      ...notificationSettings,
      emailRecipients: notificationSettings.emailRecipients.filter(e => e !== email)
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
          {loginError && <div className="text-red-600 mb-4">{loginError}</div>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 mb-4 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 mb-4 rounded"
          />
          <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
            <LogOut size={20} />
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* TABS */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-6 py-4 font-medium ${activeTab === 'leads' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              <Users size={20} className="inline mr-2" />
              Leads
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-6 py-4 font-medium ${activeTab === 'services' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              <ShoppingBag size={20} className="inline mr-2" />
              Servicios
            </button>
            <button
              onClick={() => setActiveTab('configurator')}
              className={`px-6 py-4 font-medium ${activeTab === 'configurator' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              <LayoutDashboard size={20} className="inline mr-2" />
              Configurador
            </button>
            <button
              onClick={() => setActiveTab('brand')}
              className={`px-6 py-4 font-medium ${activeTab === 'brand' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              <ImageIcon size={20} className="inline mr-2" />
              Brand Kit
            </button>
            <button
              onClick={() => setActiveTab('bot')}
              className={`px-6 py-4 font-medium ${activeTab === 'bot' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              <BrainCircuit size={20} className="inline mr-2" />
              Bot Config
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-4 font-medium ${activeTab === 'notifications' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              <Bell size={20} className="inline mr-2" />
              Notificaciones
            </button>
          </div>
        </div>

        {/* SERVICES TAB */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Servicios</h2>
            {services.map((service, idx) => (
              <div key={service.id} className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{service.title.es}</h3>
                  <p className="text-gray-600 text-sm">{service.description.es}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleServiceVisibility(idx)}
                    className={`px-3 py-1 rounded text-sm ${service.visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                  >
                    {service.visible ? <Eye size={16} className="inline" /> : <EyeOff size={16} className="inline" />}
                  </button>
                  <button onClick={() => moveService(idx, 'up')} disabled={idx === 0} className="p-1 hover:bg-gray-200 disabled:opacity-50">
                    <ArrowUp size={16} />
                  </button>
                  <button onClick={() => moveService(idx, 'down')} disabled={idx === services.length - 1} className="p-1 hover:bg-gray-200 disabled:opacity-50">
                    <ArrowDown size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CONFIGURATOR TAB */}
        {activeTab === 'configurator' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Items del Configurador</h2>
              <button onClick={handleAddNewItem} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <Plus size={20} />
                Nuevo Item
              </button>
            </div>
            {configuratorItems.map((item, idx) => (
              <div key={item.id} className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.title.es}</h3>
                  <p className="text-gray-600 text-sm">{item.benefit.es}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleItemVisibility(item)}
                    className={`px-3 py-1 rounded text-sm ${item.visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                  >
                    {item.visible ? <Eye size={16} className="inline" /> : <EyeOff size={16} className="inline" />}
                  </button>
                  <button onClick={() => moveItem(idx, 'up')} disabled={idx === 0} className="p-1 hover:bg-gray-200 disabled:opacity-50">
                    <ArrowUp size={16} />
                  </button>
                  <button onClick={() => moveItem(idx, 'down')} disabled={idx === configuratorItems.length - 1} className="p-1 hover:bg-gray-200 disabled:opacity-50">
                    <ArrowDown size={16} />
                  </button>
                  <button onClick={() => deleteItem(item.id)} className="p-1 text-red-600 hover:bg-red-100">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BRAND KIT TAB */}
        {activeTab === 'brand' && (
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Brand Kit</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Site Name"
                value={brandConfig.siteName}
                onChange={(e) => setBrandConfig({...brandConfig, siteName: e.target.value})}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Contact Email"
                value={brandConfig.contactEmail}
                onChange={(e) => setBrandConfig({...brandConfig, contactEmail: e.target.value})}
                className="w-full border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Contact Phone"
                value={brandConfig.contactPhone}
                onChange={(e) => setBrandConfig({...brandConfig, contactPhone: e.target.value})}
                className="w-full border p-2 rounded"
              />
            </div>
            <button onClick={handleSaveBrandConfig} disabled={isSavingBrand} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              <Save size={20} className="inline mr-2" />
              {isSavingBrand ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        )}

        {/* BOT CONFIG TAB */}
        {activeTab === 'bot' && botConfig && (
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Bot Configuration</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Bot Name"
                value={botConfig.name}
                onChange={(e) => setBotConfig({...botConfig, name: e.target.value})}
                className="w-full border p-2 rounded"
              />
              <select
                value={botConfig.tone}
                onChange={(e) => setBotConfig({...botConfig, tone: e.target.value as any})}
                className="w-full border p-2 rounded"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="enthusiastic">Enthusiastic</option>
                <option value="technical">Technical</option>
              </select>
            </div>
            <button onClick={saveBotConfig} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              <Save size={20} className="inline mr-2" />
              Guardar
            </button>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">Notification Settings</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email to add"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1 border p-2 rounded"
                />
                <button onClick={addEmailRecipient} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  <Plus size={20} />
                </button>
              </div>
              <div className="space-y-2">
                {notificationSettings.emailRecipients.map(email => (
                  <div key={email} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                    <span>{email}</span>
                    <button onClick={() => removeEmailRecipient(email)} className="text-red-600 hover:bg-red-100 p-1 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={saveNotificationSettings} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              <Save size={20} className="inline mr-2" />
              Guardar
            </button>
          </div>
        )}

        {/* ITEM EDITOR MODAL */}
        {isEditingItemModalOpen && editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Editar Item</h3>
                <button onClick={() => setIsEditingItemModalOpen(false)}>
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
                  onClick={() => setIsEditingItemModalOpen(false)}
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
