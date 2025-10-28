---
title: 'Mi Website Personal: Del Caos al Orden Codeando con AI'
description: 'Cómo construí este website - lecciones aprendidas sobre desarrollo con AI y la importancia de las buenas prácticas de desarrollo de software'
slug: 'tech-stack-de-este-website-2025'
pubDate: 2025-10-28
locale: es
---

# Mi Website Personal: Del Caos al Orden Codeando con AI

## Intro

Hice mi primer website en la universidad cuando me ofrecí de voluntario para el website del laboratorio de investigación. Lo reescribí from scratch sin mirar el código existente para aprender cómo se hacía—uno de los primeros leading indicators de mi habilidad para aprender rápido y mi automotivación. Este año, con los avances de AI coding tools y quizás motivado por el nacimiento de mi hija, pensé: "excelente momento para hacer mi website". Necesito un testing ground para aprender a codear con AI efectivamente, y creo que falta gente con experiencia shipping to production escribiendo y hablando sobre construir con AI. Con mi experiencia, veo que es un buen momento para shippear un MVP de mi website y blog.

## El Tech Stack

Ahora mismo estoy usando Claude Code bastante, tanto en el trabajo como en lo personal. Lo usé para decidir sobre este stack. Mi idea era tener un stack bastante liviano para el blog, pero que me permitiera añadir features al site que me parecieran interesantes para mi uso personal. También quería escoger frameworks que no he usado antes, para ver como sería aprender una tecnología nueva, con la ayuda de AI.

### Frontend: Astro + Pico CSS

Escogí el framework Astro después de investigar con Claude Code porque parece un buen testing ground para lo que quiero del blog: construir y aprender construyendo. Leyendo los docs por encima vi que era bastante lightweight y straight forward. Lo comparé con Hugo, Next.js, y otras opciones. Al final, opté por Astro porque me pareció cool, y uno no necesita otra razón para aprender for fun.

De la misma forma, escogí Pico CSS porque la idea es pasar lo menos tiempo posible pensando en el CSS y el styling, y aprender algo nuevo que no sea Tailwind, pero que sea un poco más llevadero.

Ambas elecciones fueron tecnologías o frameworks que no he usado antes, lo cual para mí es motivante porque siempre me gusta aprender cosas nuevas.

### Backend y Deployment

No tenía en mente un backend server muy complicado. Viendo que Supabase es la elección de un montón de vibe coded apps, decidí usarlo también para ver que tal. Por ahora solo estoy usándolo para la base de datos, aunque quizas pruebe algunos otros features en el futuro. En este DB es que estoy trackeando mi cafe diario, el primer vibe engineered feature de este website.

Para el deployment, escogí Vercel porque lo veo recomendado mucho y quería entender que tal. Fue extremadamente simple de setup y me gusta que tiene Preview deployments en cada Pull Request automáticamente. Para mi el Continuous Delivery es un no negociable, y hasta ahora Vercel me ha funcionado bien.

En ambos casos estoy en el tier gratis y el momento que me quieran cobrar es el momento que me movere a otra solución.

## Lecciones Codeando con AI

### La Verdad Incómoda

**Tener un AI Coding Assistant y experiencia en desarrollo de software no sustituye leer la documentación ni sustituye buenas prácticas de desarrollo de software**.

### De 0 a 1: Rápido pero Caótico

El cero a uno fue bastante rápido, utilizando las tecnologías mencioné arriba. Pero aún con conocimiento, hay que mantener control de todos los cambios que el AI esta haciendo y tener buenas prácticas de desarrollo de software, porque si no se te sale de control bien rápido.

Por ejemplo, yo le dedico horas por la noche a este proyecto y estaba shipping directamente al main branch. Varias veces me pasó que se rompió la aplicación o que pasó algo inesperado que yo no pude cachar durante la sesión con Claude Code, en casos donde Claude hace commit y push automático. Y muchas veces ahí tuve que entrar a mano a arreglar la situación.

El AI comete errores, pero uno también se equivoca en el proceso. Un ejemplo en mi caso, me pasó que rompí el nameserver configuration del DNS config de mi website. Llevo tiempo usando chrisrodz.io para mi email personal y en la emoción de ver el website en vivo, cambié el nameserver al de Vercel y no me llegaron emails por varios días hasta que sentí algo raro y me acordé que los nameservers no se tocan nunca.

### El Momento de Reflexión

Tuve muchas situaciones en las que, por no conocer bien el framework o por no planificar adecuadamente el cambio, la IA hacía modificaciones de más que no buscaba ni entendía la funcionalidad que quería. Una vez lo envié a producción con CI/CD, los cambios rápidos se reflejaban inmediatamente. En este punto, después de anunciarlo en las redes sociales y mostrar el website a dos o tres amigos y familiares, empecé a pensar: ok, necesito dar un paso atrás.

Necesitaba configurar bien el proyecto con buenas prácticas, pruebas y todo. Como si fuera yo quien escribe el código, no como si lo estuviera escribiendo un AI. También tengo que hacer Pull Requests y revisar el código seriamente. No puedo estar haciendo push directamente a main, no tiene sentido, sobre todo si quiero que el proyecto sea público y pueda mostrarse bien. Así podré sentirme orgulloso de lo que estoy haciendo.

Con respecto a las tecnologías que escogí, debía dar un paso atrás, leer la documentación y entender bien estos frameworks. Además, participar más activamente en las sesiones de codear me permitiría obtener un buen resultado y no perder tiempo. Específicamente usando Plan mode (donde el AI crea un plan detallado y pide aprobación antes de escribir código). También cambiando el enfoque a cambios más pequeños en vez de features completos.

Siento que se pierde mucho tiempo con las herramientas de AI, especialmente si una sesión se desvía. Es más fácil abandonarla y empezar algo nuevo. Resulta más sencillo hacer un `git reset`, retroceder y volver a intentarlo. Además, si no tienes buen entendimiento o el plan no está bien hecho, se complica aún más. En conclusión: el truco de magia de construir un 0 to 1 app de un solo prompt está chévere, pero no funciona para seguir iterando sobre el código.

## El Proceso Actual

Decidí construir en público, así que hice mi website un repositorio público. Para sentirme orgulloso de mi trabajo, me senté a leer todo el código, revisar la documentación completa de Astro y hacer cambios fundamentales al proceso de desarrollo.

### Documentación como Fundamento

Me aseguré que el README del repo estuviera sólido. Esto es importante para humanos y también para ayudar al AI a entender bien el proyecto.

Removí toda la redundancia entre el README y los files como AGENTS.md y Claude.md, esto fue clave. En vez de dejar que el AI genere estos files super largos, los escribí a mano con instrucciones claras y eficientes.

Ahora AGENTS.md está enfocado en el proceso de desarrollo que quiero que siga el AI en nuestras sesiones, reglas críticas que debe seguir, y enlaces a otros files con documentación más específica

### De Markdown a GitHub Issues

También evolucioné de usar Markdown files, que muchos AI agents te mueven a usar para guardar los planes que crean, a una herramienta más battle-tested. Moví todo el trabajo en progreso y todas las ideas que tengo del repo a GitHub Issues para poder trackearlo un poquito mejor y definir bien cada issue antes de empezar a programar. Como lo visualizo, algunas sesiones serán solo para planificar y usar el AI para definir bien lo que se va a hacer, explorar y dejar todo escrito en el GitHub issue. Otras sesiones serán de programar como tal, donde puedo tomar un issue bien definido y producir el pull request que lo cierre. Antes intentaba hacer todo de una sola sentada y terminaba con resultados mixtos.

## Reflexión Final

Pueden ver el código del website en GitHub ahora y también ver los features que estoy pensando de añadir al website en el futuro en los mismos GitHub issues. Tengo en mente mejorar el diario de café y añadir un dashboard de mis stats personales. También estoy trabajando algunos otros apps y otras cositas que espero mostrar en el futuro, pero por ahora pueden suscribirse aquí a mi RSS feed, seguirme en las redes o [entrar aquí](https://chrisrodz.io/cafe) para ver el café que me tomo todos los días.

Este proyecto ha sido un recordatorio de que las herramientas evolucionan, pero los principios fundamentales del buen desarrollo de software permanecen. Los AI coding assistants son increíblemente poderosos, pero funcionan mejor cuando se combinan con conocimiento profundo del stack, buenas prácticas y un proceso de desarrollo sólido.

Estoy emocionado de ver hacia dónde va este proyecto y qué puedo aprender en el camino. Si estás pensando en hacer algo similar, mi consejo es: ship rápido, pero no tengas miedo de parar, reflexionar y mejorar tu proceso. Al final, es tu proyecto y debe reflejar el nivel de calidad con el que te sientas cómodo.

- [Repo en GitHub](https://github.com/chrisrodz/chrisrodz.io)
- [RSS feed](https://chrisrodz.io/rss.xml)
- [Redes sociales](https://x.com/chrisrodz35)
- [Diario de café](https://chrisrodz.io/cafe)
