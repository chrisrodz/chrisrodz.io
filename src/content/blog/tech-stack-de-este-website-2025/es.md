---
title: 'Tech Stack de este Website'
description: 'Cómo construí mi website personal con Claude Code - lecciones aprendidas sobre desarrollo con AI y la importancia de las buenas prácticas de desarrollo de software'
slug: 'tech-stack-de-este-website-2025'
pubDate: 2025-10-28
locale: es
---

# Tech Stack de este Website

## Introducción

Recuerdo cuando hice mi primer website en la universidad. Me ofrecí de voluntario para tomar las riendas del website del laboratorio donde hacía investigación subgraduada. Lo primero que hice fue tratar de reescribirlo _from scratch_ sin mirar el código, para aprender cómo se hacía. Fue uno de los _leading indicators_ de mi futura habilidad para aprender rápido y de mi automotivación en mi propio aprendizaje.

Sin embargo, desde que empecé a trabajar, no he dedicado mucho tiempo a crear software por mi cuenta, ni para mí ni para otros. Me he enfocado en aprender y en optimizar mi tiempo en el teclado para el trabajo. Ha llovido muchísimo desde aquel entonces y he trabajado en varios _web apps_ de distintos tamaños y varios websites de distintos tamaños, pero nunca pensé en tener el mío propio.

Este año, con los avances de _AI coding tools_, una de las primeras cosas que pensé fue: "excelente momento para hacer mi website". Quizás el nacimiento de mi hija haya impulsado esta nueva motivación de expresar mi creatividad. Necesito un testing ground para aprender a codear con AI más efectivamente. Creo que también hay una falta de personas con experiencia _shipping to production_ escribiendo y hablando sobre construir con AI. A la hora de construir y _shippear_ algo a producción, sí tengo un buen sentido de qué hacer y cómo seguir _best practices_. Todo esto combinado me hizo pensar que es un excelente momento para _shippear_ un MVP de mi website y blog a ver cómo me va.

## El Tech Stack

Ahora mismo estoy usando Claude Code bastante, tanto en el trabajo como en lo personal. Lo usé para decidir sobre este _stack_. Mi idea era tener un _stack_ bastante liviano para el blog, pero que me permitiera añadir _features_ al site que me parecieran interesantes para mi uso personal. También quería escoger frameworks que no he usado antes, para ver como sería aprender una tecnología nueva, con la ayuda de AI.

### Frontend: Astro + Pico CSS

Escogí el framework Astro después de investigar con Claude Code porque parece un buen campo de pruebas para lo que quiero del blog: construir y aprender construyendo. Leyendo los docs por encima vi que era bastante lightweight y straight forward. Lo comparé con Hugo, Next.js, y otras opciones. Al final, opte por Astro porque me pareció cool, y uno no necesita otra razón para aprender for fun.

De la misma forma, escogí Pico CSS porque la idea es pasar lo menos tiempo posible pensando en el CSS y el _styling_, y aprender algo nuevo que no sea Tailwind, pero que sea un poco más llevadero.

Ambas elecciones fueron tecnologías o frameworks que no he usado antes, lo cual para mí es motivante porque siempre me gusta aprender cosas nuevas.

### Backend y Deployment

No tenía en mente un backend server muy complicado. Viendo que Supabase es la elección de un montón de vibe coded apps, decidí usarlo también para ver que tal. Por ahora solo estoy usandolo para la base de datos, aunque quizas pruebe algunos otros features en el futuro. En este DB es que estoy trackeando mi cafe diario, el primer _vibe engineered_ feature de este website.

Para el deployment, escogí Vercel porque lo veo recomendado mucho y quería entender que tal. No veo que tan diferente es de heroku o algún otro provider. Fue extremadamente simple de setup y me gusta que tiene Preview deployments en cada Pull Request automáticamente. Para mi el Continuous Delivery es un no negociable, y hasta ahora Vercel me ha funcionado bien.

En ambos casos estoy en el tier gratis y el momento que me quieran cobrar es el momento que me movere a otra solución.

## El Proceso de Desarrollo con Claude Code

El TL;DR de esta sección es que **tener un AI _Coding Assistant_ y experiencia en desarrollo de software no sustituye leer la documentación**.

### Primeras Iteraciones: Rápido pero Caótico

Tuve bastante éxito construyendo un cero a uno, utilizando las tecnologías que se están recomendando actualmente para este tipo de aplicación. Pero aún con mi conocimiento, sí aprendí que hay que controlarle el AI bastante y hay que tener buenas prácticas de desarrollo de software, porque si no se te sale de control bien rápido.

Por ejemplo, yo le dedico horas por la noche a este proyecto y estaba _shipping_ directamente al _main branch_. Varias veces me pasó que se rompió la aplicación o que pasó algo inesperado que yo no pude cachar durante la sesión con Claude Code, en casos donde Claude hace _commit_ y _push_ automático. Y muchas veces ahí tuve que entrar a mano a arreglar la situación.

El AI comete errores, pero uno también se equivoca en el proceso. Un ejemplo en mi caso, me pasó que rompí el nameserver configuration del DNS config de mi website. Llevo tiempo usando chrisrodz.io para mi email personal y en la emoción de ver el website en vivo, cambié el nameserver al de Vercel y no me llegaron emails por varios días hasta que sentí algo raro y me acordé que los nameservers no se tocan nunca.

### El Momento de Parar y Reflexionar

Tuve muchas situaciones en las que, por no conocer bien el framework o por no planificar adecuadamente el cambio, la IA hacía modificaciones de más que no buscaba ni entendía la funcionalidad que quería. Una vez lo envié a producción con CI/CD, los cambios rápidos se reflejaban inmediatamente. En este punto, después de anunciarlo en las redes sociales y mostrar el sitio web a dos o tres amigos y familiares, empecé a pensar: _ok_, necesito dar un paso atrás.

Necesitaba configurar bien el proyecto con buenas prácticas, pruebas y todo. Como si fuera yo quien escribe el código, no como si lo estuviera escribiendo un AI. También tengo que hacer _Pull Requests_ y revisar el código seriamente. No puedo estar haciendo _push_ directamente a _main_, no tiene sentido, sobre todo si quiero que el proyecto sea público y pueda mostrarse bien. Así podré sentirme orgulloso de lo que estoy haciendo.

Con respecto a las tecnologías que escogí, debía dar un paso atrás, leer la documentación y entender bien estos frameworks. Además, participar más activamente en las sesiones de codear me permitiría obtener un buen resultado y no perder tiempo. Específicamente usando Plan mode y enfocandome en cambios más pequeños. El truco de magia de construir un 0 to 1 app de un solo prompt esta chevere, pero no funciona para seguir iterando sobre el código.

Siento que se pierde mucho tiempo con las herramientas de AI, especialmente si una sesión se desvía. Es más fácil abandonarla y empezar algo nuevo. Resulta más sencillo hacer un `git reset`, retroceder y volver a intentarlo. Además, si no tienes buen entendimiento o el plan no está bien hecho, se complica aún más.

## El Proceso Actual: Construyendo en Público

Decidí construir en público, así que decidí hacer mi website un repositorio público. Para sentirme orgulloso de mi trabajo, me puse para el problema y me senté a leer todo el código, a revisar toda la documentación de Astro y hacer algunos cambios al proceso de desarrollo que creo que me van a dar más resultados en mis sesiones de codear.

### De Markdown a GitHub Issues

Específicamente, creo que hay que evolucionar de usar los _Markdown files_ que muchos AI _tools_ te mueven a usar para guardar los _plans_ o guardar las fases del plan, y mover a herramientas que están un poquito más _battle-tested_.

Estoy moviendo todo el trabajo del repo a GitHub Issues para poder _trackearlo_ un poquito mejor y definir el plan bien en el _issue_ antes de empezar a programar. Como lo veo, puedo tener sesiones que quizás lo único que yo haga sea planificar el _issue_ y usar el AI para definir bien lo que se va a hacer, explorar y dejar todo escrito en el GitHub _issue_. Y otros _sessions_ que van a ser de programar como tal, donde puedo usar el AI para tomar este GitHub _issue_, producir el _pull request_, seguir el proceso adecuado para el _pull request_ y mergear el cambio.

## Lo Que Viene

Pueden ver el código del website en GitHub ahora y también ver los _features_ que estoy pensando de añadir al website en el futuro en los mismos GitHub _issues_. Mi plan es seguir trabajando. Creo que esto es un buen _testing ground_ para todos estos _tools_ de AI.

He visto que otras personas un poco más conocidas en las redes, en el mundo de _software development_, también se han movido más a un sistema similar. Y mi plan es seguir iterando y seguir escribiendo aquí.

También estoy trabajando algunos otros _apps_ y otras cositas que espero mostrar en el futuro, pero por ahora pueden suscribirse aquí a mi RSS _feed_, seguirme en las redes o entrar aquí para ver el café que me tomo todos los días.

## Reflexión Final

Este proyecto ha sido un recordatorio de que las herramientas evolucionan, pero los principios fundamentales del buen desarrollo de software permanecen. Los AI _coding assistants_ son increíblemente poderosos, pero funcionan mejor cuando se combinan con conocimiento profundo del _stack_, buenas prácticas y un proceso de desarrollo sólido.

Estoy emocionado de ver hacia dónde va este proyecto y qué puedo aprender en el camino. Si estás pensando en hacer algo similar, mi consejo es: _ship_ rápido, pero no tengas miedo de parar, reflexionar y mejorar tu proceso. Al final, es tu proyecto y debe reflejar el nivel de calidad con el que te sientas cómodo.

- [Repo en GitHub](https://github.com/chrisrodz/chrisrodz.io)
- [RSS feed](https://chrisrodz.io/rss.xml)
- [Redes sociales](https://x.com/chrisrodz35)
- [Diario de café](https://chrisrodz.io/cafe)
