# 🥷 Mi Camino Ninja

> **Transforma tu disciplina en un juego de rol.** Sube de nivel, mantén tu racha ardiente, completa misiones y forja alianzas en este tracker de hábitos gamificado.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

## 📸 Capturas de Pantalla

*(Reemplaza estos links con las capturas reales de tu app guardadas en una carpeta `/public/docs/` o similar)*

| Tu Propio Dojo | Misiones y Hábitos | El Clan y Ranking |
|:---:|:---:|:---:|
| ![Dojo](./public/og-image.jpg) <br> *Visualiza tu nivel, oro y racha actual.* | ![Misiones](./public/og-image.jpg) <br> *Gana XP y Oro completando tareas diarias.* | ![Social](./public/og-image.jpg) <br> *Compite en el ranking y visita a tus amigos.* |

---

## ✨ Características Principales

- **Gestor de Tareas RPG:** Completa hábitos y misiones para ganar Puntos de Experiencia (XP) y Oro.
- **Sistema de Atributos:** Mejora tu Fuerza (STR), Inteligencia (INT), Sabiduría (WIS), etc., según el tipo de tarea que completes.
- **El Dojo (Tu espacio personal):** Un salón visual donde una "Llama de Racha" crece mientras seas constante.
- **Tienda de Equipamiento:** Usa tu Oro para comprar fondos y tapices (mats) para personalizar tu Dojo.
- **Sistema de Clanes (Social):** - Agrega amigos mediante un sistema de solicitudes.
  - Ranking global (Leaderboard) basado en XP.
  - Visita los dojos de otros guerreros, dales "Honor" (respeto diario limitado) y déjales un mensaje en su "Muro de Pergaminos".

---

## 🛠️ Stack Tecnológico

El proyecto está construido con un enfoque moderno, utilizando **Serverless** y renderizado híbrido para máxima velocidad:

- **Frontend:** React 18 + Next.js (App Router).
- **Estilos:** Tailwind CSS (con utilidades personalizadas y animaciones).
- **Iconos & UI:** `lucide-react` para iconografía y `sonner` para notificaciones (Toasts).
- **Backend & Base de Datos:** Supabase (PostgreSQL).
- **Autenticación:** Supabase Auth (Email/Password).
- **Lenguaje:** TypeScript estricto para seguridad en el tipado.

---

## 🏛️ Arquitectura

La aplicación sigue una arquitectura **Frontend Pesado + Backend-as-a-Service (BaaS)**:

1. **Cliente (Next.js):** Maneja el estado de la UI, la navegación y las interacciones del usuario de forma reactiva.
2. **Capa de Datos (Supabase):** - **PostgreSQL:** Actúa como la única fuente de la verdad.
   - **Row Level Security (RLS):** Garantiza que cada usuario solo pueda modificar sus propias tareas y datos, mientras permite lectura pública de los perfiles para el sistema social.
   - **Triggers:** Automatizan la creación de perfiles y la inyección de "Misiones de Bienvenida" en el momento en que un usuario se registra.
   - **RPCs (Remote Procedure Calls):** Lógica de negocio compleja (como calcular límites diarios de "Honor" o procesar compras en la tienda) se ejecuta directamente en la base de datos mediante funciones PL/pgSQL para evitar vulnerabilidades de manipulación en el cliente.

---

## 🚀 Cómo correrlo localmente

Sigue estos pasos para desplegar tu propio Dojo en tu máquina local:

### 1. Prerrequisitos
- Node.js (v18 o superior).
- Una cuenta en [Supabase](https://supabase.com/).

### 2. Clonar el repositorio
```bash
git clone [https://github.com/AgusCarretto/ninja-dojo.git](https://github.com/AgusCarretto/ninja-dojo.git)
cd ninja-dojo