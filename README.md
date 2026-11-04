# Imfundo Kahle - Sitio Web Oficial

Plataforma web de la organización sin fines de lucro **Imfundo Kahle** (Educación con equidad en Lima e Iquitos, Perú).

## 🚀 Requisitos y Tecnologías
- **Node.js**: v18.0.0 o superior
- **Express**: Framework backend
- **EJS**: Motor de plantillas dinámico

---

## 🛠️ Instalación y Ejecución Local

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar en modo desarrollo:
```bash
npm run dev
```

3. Iniciar en modo producción:
```bash
npm start
```

Abre tu navegador en `http://localhost:3000`.

---

## ☁️ Despliegue en Render

### Opción A: Web Service (Recomendada)
1. Conecta tu repositorio de GitHub en [Render](https://render.com).
2. Selecciona **New +** > **Web Service**.
3. Configuración:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

### Opción B: Static Site
1. Selecciona **New +** > **Static Site**.
2. Configuración:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
