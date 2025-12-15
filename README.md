# EportsTech Corporate Portal

Portal corporativo multilingüe para EportsTech, specialista en soluciones de networking, ciberseguridad e infraestructura TI.

## Características

- **Multilingüe**: Soporte completo para ES, CA, EN, FR, DE, IT
- **Diseño Responsive**: Optimizado para dispositivos móviles y desktop
- **Admin Dashboard**: Panel de control para gestionar contenido dinámicamente
- **Chatbot IA**: Integración con Google Gemini para atención al cliente
- **Contactos & Leads**: Sistema de formularios con almacenamiento en Supabase
- **Configurador Personalizado**: Herramienta para que usuarios customicen soluciones
- **Analytics**: Seguimiento de eventos con Google Analytics
- **Branding Dinámico**: Logo, colores y contenido configurables desde admin

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Routing**: React Router 7
- **Form Handling**: React Hook Form
- **UI Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: Google Generative AI (Gemini)
- **Styling**: Tailwind CSS
- **Analytics**: Google Analytics 4

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Navbar.tsx      # Navegación principal
│   ├── Hero.tsx        # Sección hero
│   ├── BenefitsSection.tsx
│   ├── ServicesSection.tsx
│   ├── SolutionsConfigurator.tsx
│   ├── ContactForm.tsx
│   └── Chatbot.tsx     # Widget chatbot IA
├── pages/
│   └── AdminDashboard.tsx  # Panel de administración
├── services/           # Integración con APIs
│   ├── supabaseClient.ts   # Cliente Supabase
│   ├── supabaseMock.ts     # Operaciones BD
│   ├── geminiService.ts    # Gemini AI
│   └── analytics.ts        # GA4
├── App.tsx            # Componente principal
├── types.ts           # Definiciones TypeScript
├── constants.ts       # Datos estáticos y traducciones
└── index.tsx          # Entry point
```

## Instalación

### Requisitos
- Node.js 18+
- npm o yarn

### Setup

1. **Clonar repositorio**
   ```bash
   git clone https://github.com/tu-usuario/eportstech-portal.git
   cd eportstech-portal
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Variables de entorno**
   Crear archivo `.env.local`:
   ```env
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_key
   VITE_GOOGLE_GEMINI_API_KEY=tu_gemini_key
   VITE_GA_MEASUREMENT_ID=tu_ga_id
   ```

4. **Desarrollo**
   ```bash
   npm run dev
   ```
   Abrirá http://localhost:5173

5. **Build para producción**
   ```bash
   npm run build
   npm run preview
   ```

## Base de Datos (Supabase)

### Tablas requeridas:

```sql
-- brand_config
CREATE TABLE brand_config (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  siteName TEXT,
  favicon TEXT,
  navLogo TEXT,
  footerLogo TEXT,
  contactEmail TEXT,
  contactPhone TEXT,
  heroImage TEXT,
  heroTitle JSONB,
  heroSubtitle JSONB,
  heroCtaText JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- leads
CREATE TABLE leads (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  fullName TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  serviceInterest TEXT,
  message TEXT,
  address TEXT,
  city TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- configurator_leads
CREATE TABLE configurator_leads (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  fullName TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  selectedItems JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- bot_config
CREATE TABLE bot_config (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT,
  tone TEXT,
  responseLength TEXT,
  highlightedProduct TEXT,
  businessHoursStart TEXT,
  businessHoursEnd TEXT,
  timezone TEXT,
  limitations JSONB,
  qualifyingQuestions JSONB,
  customInstructions TEXT,
  knowledgeBase JSONB,
  updated_at TIMESTAMP DEFAULT now()
);

-- notification_settings
CREATE TABLE notification_settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  emailRecipients JSONB,
  notifyOnLead BOOLEAN DEFAULT true,
  notifyOnConfigurator BOOLEAN DEFAULT true
);
```

## Admin Dashboard

Acceder a `/admin` para gestionar:
- Configuración de branding (logo, colores, contacto)
- Contenido dinámico (hero, beneficios, servicios)
- Configuración del chatbot IA
- Visualización de leads y consultas
- Estadísticas y analytics

**Nota**: El acceso requiere autenticación via Supabase Auth.

## Deployment

### Netlify
1. Conectar repositorio GitHub a Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configurar variables de entorno en Netlify

### Servidor propio (eports)
1. Build: `npm run build`
2. Copiar contenido de `dist/` al servidor web
3. Configurar base de datos PostgreSQL propia
4. Actualizar `supabaseMock.ts` para usar instancia propia

## Variables de Entorno Producción

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google Gemini API
VITE_GOOGLE_GEMINI_API_KEY=your-gemini-api-key

# Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Admin Auth (Supabase)
VITE_ADMIN_EMAIL=admin@eportstech.com
VITE_ADMIN_PASSWORD=secure_password
```

## Features Destacadas

### 🤖 Chatbot IA (Gemini)
- Responde preguntas sobre servicios
- Integración natural en la web
- Configurable desde admin dashboard
- Historial de conversaciones

### 📊 Admin Dashboard
- Edición en vivo de contenido
- Gestión de leads y consultas
- Estadísticas de uso
- Configuración avanzada del chatbot

### 🎯 Solutions Configurator
- Herramienta interactiva para customizar soluciones
- Genera presupuestos personalizados
- Integración con formulario de contacto

### 🌐 Multilingüe
- Interfaz completa en 6 idiomas
- Fácil de expandir con nuevos idiomas
- Traducciones centralizadas en `constants.ts`

## Roadmap

- [ ] Sistema de autenticación mejorado
- [ ] Exportar leads a PDF/Excel
- [ ] Integración con CRM (Salesforce, Hubspot)
- [ ] Blog dinámico
- [ ] E-commerce para servicios
- [ ] Calendario de citas automático

## Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre Pull Request

## License

Propiedad de EportsTech. Todos los derechos reservados.

## Soporte

Para soporte técnico contactar con el equipo de desarrollo de eports.

---

Generado desde Google AI Studio. Última actualización: Diciembre 2024
