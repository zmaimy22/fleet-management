# 🚛 Sistema de Gestión de Flotas ILUNION

> Sistema completo para la gestión de conductores, rutas y turnos de trabajo con patrón 4/2

[![Status](https://img.shields.io/badge/status-en%20desarrollo-yellow)](https://github.com)
[![Node](https://img.shields.io/badge/node-%3E%3D16-brightgreen)](https://nodejs.org)
[![React](https://img.shields.io/badge/react-18.3-blue)](https://reactjs.org)
[![License](https://img.shields.io/badge/license-Private-red)](LICENSE)

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Desarrollo](#-desarrollo)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## 📖 Descripción

Sistema de gestión integral diseñado específicamente para **ILUNION** que permite:

- ✅ Gestionar conductores por categorías y tipos
- ✅ Crear y mantener calendarios de turnos
- ✅ Generar automáticamente patrones de trabajo 4/2 (4 días trabajo, 2 descanso)
- ✅ Asignar rutas a conductores
- ✅ Analizar cobertura diaria y mensual
- ✅ Exportar calendarios a Excel con formato profesional
- ✅ Interfaz trilingüe (Español / العربية / English)

**Estado actual:** 🚧 En desarrollo activo - Nuevas funcionalidades en camino

---

## ✨ Características

### 📅 Gestión de Calendario

- **Visualización mensual** completa de todos los conductores
- **Generación automática** de turnos con patrón 4/2
- **Continuidad inteligente** entre meses
- **Códigos de color** para diferentes estados (trabajo, vacaciones, enfermedad)
- **Edición manual** de celdas individuales
- **Navegación** fluida entre meses

### 👥 Gestión de Conductores

- **Categorías**: Lanzarote, Local Mañana, Local Noche, Personal
- **Tipos**: Conductor, Cargador, Supervisor
- **CRUD completo**: Crear, leer, actualizar, eliminar
- **Información detallada**: Nombre, categoría, tipo, estado
- **Búsqueda y filtrado**

### 🛣️ Gestión de Rutas

- Administración de **15 rutas** (R1-R15)
- **Asignación automática** de conductores según disponibilidad
- **Identificación inmediata** de rutas sin cobertura
- **Alertas visuales** para turnos descubiertos

### 📊 Estadísticas y Cobertura

- **Panel de cobertura diaria** con porcentajes
- **Análisis mensual** completo
- **Identificación visual** de días completos, parciales o sin cobertura
- **Detalle por día**: Ver qué conductor cubre cada ruta
- **Rutas faltantes**: Listado claro de turnos sin asignar

### 📤 Exportación

- **Exportar a Excel** con todos los colores preservados
- **Hoja de leyenda** automática incluida
- **Formato profesional** listo para imprimir
- **Biblioteca ExcelJS** para compatibilidad total

### 🌐 Multiidioma

- **Español** (ES)
- **Árabe** (AR)
- **Inglés** (EN) - En progreso

---

## 🛠️ Tecnologías

### Frontend

- **React 18.3** - Biblioteca principal de UI
- **Vite 5.4** - Herramienta de build ultrarrápida
- **Tailwind CSS 3.4** - Framework de estilos utility-first
- **Lucide React** - Iconos modernos y ligeros

### Librerías

- **ExcelJS** - Generación y manipulación de archivos Excel
- **LocalStorage** - Persistencia de datos en el navegador

### Desarrollo

- **ESLint** - Linter para JavaScript
- **PostCSS** - Procesador de CSS
- **Autoprefixer** - Prefijos CSS automáticos

---

## 🚀 Instalación

### Requisitos Previos

- **Node.js** 16 o superior ([Descargar](https://nodejs.org))
- **npm** 7 o superior (viene con Node.js)

### Verificar instalación

```bash
node --version  # Debe mostrar v16.0.0 o superior
npm --version   # Debe mostrar 7.0.0 o superior
```

### Pasos de Instalación

1. **Clonar el repositorio** (o descomprimir ZIP)

```bash
git clone https://github.com/YOUR_USERNAME/fleet-management.git
cd fleet-management
```

2. **Instalar dependencias**

```bash
npm install
```

_Este proceso puede tomar 1-3 minutos dependiendo de tu conexión._

3. **Iniciar servidor de desarrollo**

```bash
npm run dev
```

4. **Abrir en el navegador**

```
http://localhost:3000
```

🎉 **¡Listo! El sistema está funcionando.**

---

## 💻 Uso

### Inicio Rápido

1. **Navegación**: Usa el menú superior para cambiar entre secciones
2. **Calendario**: Visualiza y edita turnos por mes
3. **Conductores**: Añade o modifica información de conductores
4. **Rutas**: Gestiona las rutas disponibles
5. **Cobertura**: Analiza estadísticas de cobertura
6. **Exportar**: Descarga el calendario en formato Excel

### Generar Calendario

1. Ve a la pestaña **Calendario**
2. Selecciona el mes deseado
3. Haz clic en **"Generate 4/2"**
4. El sistema generará automáticamente los turnos

### Editar Turnos Manualmente

1. Haz clic en cualquier celda del calendario
2. Se abrirá un modal de edición
3. Selecciona el tipo de turno (Trabajo, Vacaciones, Enfermedad, etc.)
4. Guarda los cambios

### Exportar a Excel

1. Ve a **Calendario**
2. Haz clic en **"Export to Excel"**
3. El archivo se descargará automáticamente
4. Incluye todos los colores y una hoja de leyenda

---

## 📁 Estructura del Proyecto

```
fleet-management/
│
├── 📂 src/                          # Código fuente
│   ├── 📂 components/               # Componentes React
│   │   ├── Calendar.jsx             # Componente principal del calendario
│   │   ├── CoverageStats.jsx        # Estadísticas de cobertura
│   │   ├── CellEditModal.jsx        # Modal para editar celdas
│   │   ├── DriverModal.jsx          # Modal para conductores
│   │   ├── DriversList.jsx          # Lista de conductores
│   │   ├── RoutesList.jsx           # Gestión de rutas
│   │   ├── Stats.jsx                # Página de estadísticas
│   │   └── Navbar.jsx               # Barra de navegación
│   │
│   ├── 📂 data/                     # Datos iniciales
│   │   ├── drivers.js               # Lista de conductores
│   │   └── routes.js                # Configuración de rutas
│   │
│   ├── 📂 hooks/                    # React Hooks personalizados
│   │   ├── useDrivers.jsx           # Hook para gestión de conductores
│   │   ├── useRoutes.jsx            # Hook para gestión de rutas
│   │   └── useLanguage.jsx          # Hook para multiidioma
│   │
│   ├── 📂 i18n/                     # Internacionalización
│   │   └── translations.js          # Traducciones ES/AR/EN
│   │
│   ├── App.jsx                      # Componente raíz
│   ├── main.jsx                     # Punto de entrada
│   └── index.css                    # Estilos globales
│
├── 📂 public/                       # Archivos públicos
│   └── truck.svg                    # Icono de la aplicación
│
├── 📄 index.html                    # HTML principal
├── 📄 package.json                  # Dependencias y scripts
├── 📄 vite.config.js                # Configuración de Vite
├── 📄 tailwind.config.js            # Configuración de Tailwind
├── 📄 .gitignore                    # Archivos ignorados por Git
├── 📄 INSTALACION.md                # Guía detallada de instalación
├── 📄 COMANDOS_GIT.txt              # Comandos Git útiles
└── 📄 README.md                     # Este archivo
```

---

## 📸 Capturas de Pantalla

### Calendario Principal

Vista mensual completa con todos los conductores organizados por categorías.

### Panel de Cobertura

Análisis diario con identificación visual de días completos, parciales y sin cobertura.

### Gestión de Conductores

Interfaz intuitiva para añadir, editar y eliminar conductores.

### Exportación Excel

Archivo Excel profesional con colores y leyenda incluida.

---

## 🔧 Desarrollo

### Scripts Disponibles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de la build
npm run preview

# Linter
npm run lint
```

### Variables de Entorno

No se requieren variables de entorno. Todo funciona localmente.

### Estructura de Datos

Los datos se almacenan en `localStorage` del navegador:

```javascript
// Ejemplo de estructura de conductores
{
  id: "1",
  name: "Juan Pérez",
  category: "local-morning",
  type: "driver"
}

// Ejemplo de estructura de calendario
{
  "driverId_1": {
    "1": { type: "work", value: "R1" },
    "2": { type: "work", value: "R1" },
    "3": { type: "rest", value: "" }
  }
}
```

---

## 🔒 Privacidad y Seguridad

### Almacenamiento Local

- ✅ **100% Local**: Todos los datos se guardan en tu navegador
- ✅ **Sin servidor**: No hay conexión a bases de datos externas
- ✅ **Privado**: Solo tú puedes acceder a tu información
- ✅ **Offline**: Funciona sin conexión a Internet

### Backup

Para hacer copia de seguridad:

1. **Opción 1**: Exporta a Excel regularmente
2. **Opción 2**: Backup manual de localStorage (ver INSTALACION.md)

---

## 🚧 Roadmap

### En Desarrollo

- [ ] Sistema de autenticación opcional
- [ ] Sincronización en la nube (opcional)
- [ ] Aplicación móvil nativa
- [ ] Más tipos de reportes estadísticos
- [ ] Notificaciones de turnos

### Completado

- [x] Generación automática de turnos 4/2
- [x] Exportación a Excel con colores
- [x] Panel de cobertura diaria
- [x] Gestión completa de conductores
- [x] Interfaz trilingüe
- [x] Edición manual de celdas

---

## 🤝 Contribución

Este es un proyecto privado de ILUNION. Las contribuciones están limitadas al equipo interno.

### Para el equipo de desarrollo:

1. Crea una rama nueva: `git checkout -b feature/nueva-funcionalidad`
2. Haz tus cambios y commits: `git commit -m 'Añadir nueva funcionalidad'`
3. Push a la rama: `git push origin feature/nueva-funcionalidad`
4. Abre un Pull Request

---

## 📝 Licencia

Este proyecto es **privado** y pertenece a **ILUNION**.

Todos los derechos reservados © 2025 ILUNION

---

## 👨‍💻 Autor

Desarrollado para **ILUNION**

---

## 📞 Soporte

Para soporte técnico o consultas:

- 📧 Email: abojad.tasnim@yahoo.com
- 📄 Documentación: Ver [INSTALACION.md](INSTALACION.md)
- 🐛 Reportar bugs: [GitHub Issues]

---

## 🙏 Agradecimientos

- Equipo de ILUNION por los requisitos y feedback
- Comunidad de React por las herramientas
- Todos los testers que ayudaron a mejorar el sistema

---

<div align="center">

**[⬆ Volver arriba](#-sistema-de-gestión-de-flotas-ilunion)**

Hecho con ❤️ para ILUNION

</div>
