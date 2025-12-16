🗺️ Incident Management System – Backend Oriented MVP

Sistema de gestión de incidentes con geolocalización, autenticación y control de roles.
El foco principal del proyecto está en el backend, mientras que el frontend funciona como cliente MVP para exponer y demostrar la API.

🚀 Descripción general

Esta aplicación permite:

Registrar y visualizar incidentes geolocalizados en un mapa

Gestionar usuarios, agentes y asignaciones

Aplicar control de acceso por roles (admin / usuario)

Consumir la información desde un frontend web simple tipo dashboard

El proyecto fue desarrollado con una arquitectura backend escalable, y un frontend funcional orientado a demo y portfolio.

🧱 Arquitectura
Backend (core del proyecto)

Runtime: Node.js + TypeScript

Framework: Express

Base de datos: MySQL

ORM: Sequelize

Validación: Zod

Auth: JWT

RBAC: control por roles (admin / user)

Logs: Pino

Middlewares: helmet, cors, compression

Arquitectura por capas:

schemas

models

repositories

services

controllers

routes

Frontend (cliente MVP)

Framework: React

Estado global: Zustand

Routing: React Router

Mapa: integración con API de mapas

Rol: cliente visual para consumir la API

Auth: manejo de sesión con JWT

RBAC UI: vistas diferenciadas para admin y usuarios

El frontend fue construido como MVP, priorizando funcionalidad e integración con el backend por sobre diseño visual avanzado.

🔐 Roles y permisos
Usuario

Registro y login

Visualización del mapa

Creación de incidentes

Visualización de incidentes

Administrador

Todo lo anterior

Visualización de:

usuarios

agentes

asignaciones

Vista contextual de relaciones entre incidentes, agentes y assignments (solo lectura)

🗺️ Funcionalidades principales

Autenticación (login / register)

Mapa como home principal

Incidentes geolocalizados

Creación de incidentes desde el mapa

Dashboard admin (users, agents, assignments)

Control de acceso por rol

Manejo de estados, loading y errores

⚙️ Instalación y ejecución (local)
Requisitos

Node.js 18+

pnpm

MySQL

Clonar repositorio
git clone <repo-url>
cd incidents-system

Variables de entorno

Crear .env en backend basado en .env.example.

Instalar dependencias
pnpm install

Ejecutar en desarrollo (monorepo)
pnpm dev


Frontend: http://localhost:5173

Backend: http://localhost:3000

🎯 Objetivo del proyecto

Practicar y demostrar backend development profesional

Diseñar una API escalable y bien estructurada

Integrar frontend como cliente real

Cerrar un proyecto completo y publicable para portfolio

📌 Notas finales

Este proyecto está pensado como base para:

futuras apps mobile

dashboards más avanzados

extensiones de negocio

demostraciones técnicas en entrevistas

El foco está en arquitectura, integración y cierre de producto, no en UI compleja.

👤 Autor

Lautaro Carrizo
Backend-oriented Developer
Node.js · TypeScript · Java · Spring Boot · SQL