import { supabase } from './supabaseClient';
import { LeadForm, BrandConfig, ConfiguratorLead, NotificationSettings, GlobalSettings, Service, ConfiguratorItem, DynamicSection, ServiceCategory, ConfiguratorItemResult, BotConfig, BenefitsConfig } from "../types";
import { TRANSLATIONS, SERVICES_DATA, CONFIGURATOR_ITEMS } from '../constants';

// --- REAL SUPABASE IMPLEMENTATION ---
// This file replaces the mock data with actual DB calls.
// Ensure your Supabase DB has tables: 'brand_config', 'services', 'configurator_items', 'leads', 'bot_config', 'notification_settings'

// --- HELPER: Upload Files to Storage ---
export const uploadFileToStorage = async (file: File, bucket: string, path: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${path}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    console.error('Storage upload exception:', error);
    return null;
  }
};

// --- AUTH ---

export const checkAuth = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

// Now accepts email and password for real auth
export const loginMock = async (password: string, email?: string): Promise<boolean> => {
  if (!email) {
     console.error("Email required for real Supabase auth");
     return false;
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
      console.error("Login error:", error.message);
      return false;
  }
  return true;
};

export const logoutMock = async () => {
  await supabase.auth.signOut();
};

// --- BRAND CONFIG ---

export const getBrandConfig = async (): Promise<BrandConfig> => {
  const { data, error } = await supabase
    .from('brand_config')
    .select('*')
    .single();

  if (error || !data) {
    console.warn("Could not fetch brand config (using defaults/mock temporarily)", error);
    // Fallback to initial structure if DB is empty to prevent crash
    return {
        siteName: "EportsTech",
        favicon: "",
        navLogo: '/logo-blue.png',
        footerLogo: '/logo-white.png',
        contactEmail: 'contact@eportstech.com',
        contactPhone: '+34 900 123 456',
        hero: {
            image: '/hq-background.jpg',
            imagePosition: 'center',
            overlayOpacity: 0.6,
            title: TRANSLATIONS.heroTitle,
            subtitle: TRANSLATIONS.heroSubtitle,
            ctaText: TRANSLATIONS.ctaButton
        },
        benefits: {
            mainTitle: TRANSLATIONS.benefitsTitle,
            subtitle: TRANSLATIONS.benefitsSubtitle,
            items: []
        },
        footer: {
            copyrightText: { es: "© 2024", ca: "© 2024", en: "© 2024", fr: "© 2024", de: "© 2024", it: "© 2024" },
            privacyText: { es: "Privacidad", ca: "Privacitat", en: "Privacy", fr: "Confidentialité", de: "Datenschutz", it: "Privacy" },
            legalText: { es: "Legal", ca: "Legal", en: "Legal", fr: "Légal", de: "Rechtlich", it: "Legale" },
            cookiesText: { es: "Cookies", ca: "Cookies", en: "Cookies", fr: "Cookies", de: "Cookies", it: "Cookies" }
        }
    };
  }
  return data as BrandConfig;
};

// Updated to handle file uploads
export const updateBrandConfig = async (config: Partial<BrandConfig>, files?: Record<string, File>): Promise<boolean> => {
  let updatedConfig = { ...config };

  // Handle File Uploads if present
  if (files) {
      if (files.navLogo) {
          const url = await uploadFileToStorage(files.navLogo, 'brand-assets', 'nav-logo');
          if (url) updatedConfig.navLogo = url;
      }
      if (files.footerLogo) {
          const url = await uploadFileToStorage(files.footerLogo, 'brand-assets', 'footer-logo');
          if (url) updatedConfig.footerLogo = url;
      }
      if (files.favicon) {
          const url = await uploadFileToStorage(files.favicon, 'brand-assets', 'favicon');
          if (url) updatedConfig.favicon = url;
      }
      if (files.heroImage) {
          const url = await uploadFileToStorage(files.heroImage, 'brand-assets', 'hero-bg');
          if (url && updatedConfig.hero) updatedConfig.hero.image = url;
      }
  }

  // Determine if update or insert (usually we have one row with ID 1)
  const { error } = await supabase
    .from('brand_config')
    .update(updatedConfig)
    .eq('id', 1); // Assuming singleton pattern row id=1

  if (error) {
      console.error("Error updating brand config:", error);
      return false;
  }
  return true;
};

// --- SERVICES ---

export const getServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error || !data || data.length === 0) {
      // Return constants if DB empty
      return SERVICES_DATA;
  }
  return data as Service[];
};

export const updateServices = async (services: Service[]): Promise<boolean> => {
  const { error } = await supabase
    .from('services')
    .upsert(services);

  if (error) {
      console.error("Error updating services:", error);
      return false;
  }
  return true;
};

// --- CONFIGURATOR ITEMS ---

export const getConfiguratorItems = async (): Promise<ConfiguratorItem[]> => {
  const { data, error } = await supabase
    .from('configurator_items')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error || !data || data.length === 0) {
      return CONFIGURATOR_ITEMS;
  }
  return data as ConfiguratorItem[];
};

export const updateConfiguratorItemsOrder = async (items: ConfiguratorItem[]): Promise<boolean> => {
  const { error } = await supabase
    .from('configurator_items')
    .upsert(items);
  return !error;
};

export const saveConfiguratorItem = async (item: ConfiguratorItem): Promise<boolean> => {
  const { error } = await supabase
    .from('configurator_items')
    .upsert(item);
  return !error;
};

export const deleteConfiguratorItem = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('configurator_items')
    .delete()
    .eq('id', id);
  return !error;
};

// --- CUSTOM SECTIONS ---
// (Simplified for now, similar pattern)
export const getCustomSections = async (): Promise<DynamicSection[]> => {
  return []; // Placeholder until table created
};

// --- LEADS ---

export const submitLead = async (data: LeadForm): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase
    .from('leads')
    .insert([{ ...data, created_at: new Date() }]);

  if (error) {
      console.error("Error submitting lead:", error);
      return { success: false, error: error.message };
  }
  return { success: true };
};

export const submitConfiguratorLead = async (leadData: Omit<ConfiguratorLead, 'id' | 'createdAt'>): Promise<{ success: boolean }> => {
  const { error } = await supabase
    .from('configurator_leads')
    .insert([{ ...leadData, created_at: new Date() }]);

  if (error) {
      console.error("Error submitting config lead:", error);
      return { success: false };
  }
  return { success: true };
};

export const getConfiguratorLeads = async (): Promise<ConfiguratorLead[]> => {
  const { data, error } = await supabase
    .from('configurator_leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  // Map snake_case DB to camelCase if necessary, or ensure DB columns match types
  return data as unknown as ConfiguratorLead[];
};

// --- BOT CONFIG ---

export const getBotConfig = async (): Promise<BotConfig> => {
  const { data, error } = await supabase
    .from('bot_config')
    .select('*')
    .single();

  if (error || !data) {
      // Fallback
      return {
          name: "NEXI_tech",
          tone: "professional" as const,
          responseLength: "balanced" as const,
          highlightedProduct: "Services",
          businessHoursStart: "09:00",
          businessHoursEnd: "18:00",
          timezone: "Europe/Madrid",
          limitations: [],
          qualifyingQuestions: [],
          customInstructions: "",
          knowledgeBase: []
      };
  }
  return data as BotConfig;
};

export const updateBotConfig = async (config: BotConfig): Promise<boolean> => {
   const { error } = await supabase
    .from('bot_config')
    .update(config)
    .eq('id', 1);
   return !error;
};

// --- NOTIFICATIONS ---

export const getNotificationSettings = async (): Promise<NotificationSettings> => {
    const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .single();

    if(error || !data) {
        return { emailRecipients: [], notifyOnLead: true, notifyOnConfigurator: true };
    }
    return data as NotificationSettings;
};

export const updateNotificationSettings = async (settings: NotificationSettings): Promise<boolean> => {
    const { error } = await supabase
    .from('notification_settings')
    .update(settings)
    .eq('id', 1);
    return !error;
};