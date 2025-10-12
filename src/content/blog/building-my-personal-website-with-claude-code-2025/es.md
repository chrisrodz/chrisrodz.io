---
title: 'Tech Stack del Website'
description: 'Las decisiones técnicas y no tan técnicas que tome para crear este site'
slug: 'website-tech-stack'
pubDate: 2025-10-13
locale: es
tags: ['desarrollo web', 'ia', 'astro', 'personal']
---

# Tech Stack del Website

## Introducción

[Expande sobre por qué decidiste construir un sitio web personal y qué esperabas lograr con él]

## Eligiendo la Pila Tecnológica

**Decisiones clave:**

- **Astro v5** para SSR y arquitectura centrada en contenido
- **PicoCSS** para estilos semánticos y accesibles con mínima sobrecarga
- **Supabase** para funciones backend (seguimiento de café, registros de entrenamiento)
- **Vercel** para despliegue sin problemas con auto-deploys desde la rama main

[Expande sobre por qué estas tecnologías tenían sentido para tu caso de uso - rendimiento, experiencia del desarrollador, etc.]

## El Proceso de Desarrollo con Claude Code

### Configuración Inicial y Arquitectura

[Describe cómo Claude ayudó a configurar la estructura inicial del proyecto, archivos de configuración y decisiones arquitectónicas clave]

**Lo que funcionó bien:**

- Prototipado rápido de diseños de página
- Configuración correcta de patrones SSR desde el principio
- Implementación de soporte i18n para inglés y español

### Construyendo Colecciones de Contenido

[Habla sobre la implementación del sistema de blog con Astro Content Collections, la estructura de traducción basada en carpetas, y cómo Claude ayudó a navegar la documentación]

**Aprendizaje clave:** Entender la diferencia entre generación estática y SSR en Astro v5 fue crucial para rutas dinámicas.

### Agregando Funciones Interactivas

[Discute la implementación del sistema de seguimiento de café, registros de entrenamiento u otras funciones interactivas]

**Patrón de colaboración:** Yo describía lo que quería, Claude proponía soluciones, e iterábamos basándonos en pruebas y mi retroalimentación.

### Decisiones de Estilo y Diseño

[Habla sobre elegir PicoCSS, implementar modo oscuro y mantener conformidad WCAG]

**Filosofía:** HTML semántico primero, mejora progresiva, respetar preferencias del usuario (modo oscuro, movimiento reducido, etc.)

### Despliegue e Iteración

[Describe el proceso de despliegue a Vercel, configuración de variables de entorno y el ciclo de retroalimentación de hacer mejoras]

## Lecciones Aprendidas

### En Qué Claude Code Sobresalió

- Generar código repetitivo y plantillas
- Explicar conceptos complejos (SSR vs SSG, API de Content Collections)
- Detectar errores temprano (errores de tipo, brechas de validación)
- Sugerir mejores prácticas (patrones de seguridad, accesibilidad)

### Qué Requirió Juicio Humano

- Decisiones de diseño y estética visual
- Estrategia de contenido y arquitectura de información
- Equilibrar funciones vs simplicidad
- Voz personal y estilo de escritura

### Perspectivas del Flujo de Trabajo de Desarrollo

[Comparte perspectivas sobre el flujo de trabajo de ramas, proceso de PR, pruebas locales, etc.]

## Planes Futuros

[Menciona funciones que quieres agregar, mejoras que estás considerando o experimentos que quieres probar]

## Reflexiones Finales

[Reflexiona sobre la experiencia de construir con un asistente de programación IA - qué te sorprendió, qué harías diferente la próxima vez, y consejos para otros considerando un enfoque similar]

---

**Pila Tecnológica:** Astro v5, TypeScript, PicoCSS, Tailwind CSS, Supabase, Vercel
