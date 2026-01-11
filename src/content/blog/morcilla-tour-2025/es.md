---
title: 'El Corillo Morcillero 2025: Parrandas, Tradición y una App'
description: 'Cómo construí parranda.app para mi grupo de parranda usando AI coding tools - iterando en vivo durante las parrandas'
slug: 'morcilla-tour-2025'
pubDate: 2026-01-09
locale: es
---

> "Me hace feliz todo lo que pueda hacer para que permanezca nuestra tradición y motivar a los jóvenes para que también mantengan ese legado que vino de nuestros ancestros. Eso es responsabilidad de todos porque el pueblo que pierde su tradición desaparece, pero hay personas dispuestas a mantenerla"
> — Herminio de Jesús

Las navidades son mi época favorita del año por muchísimas razones, una de las más grandes siendo las parrandas y en particular El Morcilla Tour, un grupo de parranda organizado por mis amigos y familiares más cercanos. Empezando en Black Friday, tenemos un calendario de parrandas que usualmente termina en las SanSe.

Este año yo quería elevar la experiencia de las parrandas un poco y mi hermano me compartió una idea de hacer un app para el Morcilla Tour. Lo primero que pensé fue: "Al fin voy a construir algo que resuelve un problema personal". Y en poco tiempo nació [parranda.app](https://parranda.app), con nuestro cancionero oficial y los puntos de encuentro accesibles (solo para miembros aprobados). En este post quiero contarles un poco del Morcilla Tour, las parrandas y el proceso de desarrollo de parranda.app. Vamo' allá.

Trabajé en el app por las noches y entre breaks de cuidar a la bebé. Y el 100% del código lo escribió algún LLM. Si eso es lo que te interesa, puedes bajar directo a esa parte del blog.

## ¿Qué es una parranda puertorriqueña?

Don Herminio de Jesús, conocido como el padre de la parranda puertorriqueña, en su libro "Historia de la celebración navideña en Puerto Rico" nos cuenta la historia completa de donde nació esta tradición y tiene una guía completa de como llevar tu parranda. Descubrí el libro hace un par de años porque mi papá, el pianista del Corillo Morcillero, lo compró y me lo prestó. Eso es un cuento para otro día.

Las parrandas en Puerto Rico son una de las tradiciones navideñas más bonitas, y en mi opinión el mejor jangueo navideño en PR. Una parranda no es una banda, ni un show en vivo como los que se dan en las fiestas patronales. Es un grupo de amistades y familiares que se unen para "sorprender" a algún conocido con música y alegría. Usualmente se celebran tarde en la noche, y los que reciben la parranda lo hacen con amor y alegría ya que las canciones que se cantan son parte integral de nuestra cultura puertorriqueña. Se canta, se baila, se goza, se come, se bebe y sobretodo se mantiene viva nuestra tradición.

## El Morcilla Tour

Nuestro grupo de parranda se llama El Morcilla Tour y los miembros El Corillo Morcillero. Nuestro lema es sencillo: "Tu me das morcilla, y yo te doy el resto!". Las casas que visitamos solo les pedimos que nos reciban con morcilla (y si se cuela un asopao lo aceptamos con gusto). Gracias a Dios nunca nos ha faltado quien toque ni quien cante en las parrandas. Tampoco nos ha faltado gente buena que se atreva a recibir al corillo en su casa. Desde hace como 10 años mi hermana es la coordinadora de este grupo. Y no se si fue después de María o después de la pandemia que el grupo empezó a crecer exponencialmente. Inclusive este año llegamos a salir en televisión y llevamos parrandas a casas más lejos que antes nunca. Este season del Morcilla Tour se unieron también varias personas que ayudaron a llevar la música de la parranda a otro nivel. Junto al piano, el bajo, el güiro y los otros instrumentos que siempre nos acompañan, lo dimos todo y las parrandas estuvieron a otro nivel.

Cabe resaltar que tenemos unas reglas básicas para cualquiera que llegue a las parrandas y quiera ser parte del corillo. El que no las siga no puede ser parte:

1. Bailar y cantar, aunque tengas dos pies izquierdos y cantes sin afinar
2. Respetar la casa que visitamos como si fuera la tuya
3. No fumar dentro de la casa ni en los alrededores
4. Traer tus refrigerios y accesorios navideños

Ahora sí, a lo que vinimos. Hablemos del Parranda App.

## Parranda App

El 10 de noviembre me llegó el mensaje con la idea para el app y el día después empecé a programar como tal:

> **Morcilla Tour App:**
> Funcionalidades:
>
> - Mapa y Fecha de parrandas (Revealed by owners)
> - Buy Merch from the App
> - Upload Parranda Pics into a private Morcilleros Feed
> - Cancionero
> - Gamified experience - Badges for attending parrandas
> - Badges for singing / bringing instruments
> - Sing along
> - AR Experiences

No construí todo lo que teníamos en la idea original. Aquí un pequeño timeline del proyecto hasta hoy:

- **Nov 11-17**: Diseño y implementación inicial en React Native
- **Nov 18-24**: Chillando goma para lanzar en iOS y Android
- **Nov 25 - Dic 1**: Pivot a lanzar el app en web bajo parranda.app
- **Dic 2-9**: Chillando goma con el feature de galería que no se usó
- **Todo Dic**: Añadiendo canciones y mejorando la experiencia de usuario

Como pueden ver en el timeline, pasé mucho tiempo chillando goma (sin lograr mucho progreso). No es malo, ya que eso es parte del proceso de aprendizaje. Empecé el proyecto pensando que sería un app que la gente pueda bajar del app store directamente. Desafortunadamente, ese approach no funciona si quieres lanzar bien rápido, menos si estás trabajando con poco tiempo libre. Tampoco funciona si quieres que las personas se registren en el app para hacer login. Por último, aproveché esta oportunidad para adentrarme más en Supabase porque lo he visto en las redes y quería probarlo en un proyecto. En fin, estuve mucho tiempo enfocado en tareas que no eran valiosas para el proyecto.

Quedando varios días para la primera parranda, y una vez le hice un demo a mi hermana del app, decidí hacer el pivot a web. Literalmente tomó 1 prompt y un ratito testing para lanzar en react-native-web. Para el nombre del website consideramos morcillatour.com, o algún domain así, pero se nos ocurrió [parranda.app](https://parranda.app) como un nombre catchy, que puede servir a cualquier grupo de parranda. Vercel fue clave para lanzar el app en web de forma rápida y sencilla.

<img src="/blog/morcilla-tour-2025/parranda-app-home.jpg" alt="Parranda App - Pantalla principal" class="phone-screenshot" />

## El Cancionero: El Feature Estrella

El feature estrella del app este season definitivamente fue el cancionero. Tenemos un cancionero en PDF que siempre usamos, pero el UX de abrir un PDF en el celular y navegar por el es bien porquería. La gente muchas veces estaban tratando de descifrar lo que dice la canción entre medio de los panderos, el cencerro, el güiro y el resto de la música. Con el cancionero digital nuestro coro de 100 personas se escuchaba en unísono mucho más que antes. Cuando todo el Corillo Morcillero tiene las canciones, pueden enfocarse más en cantar, bailar y pasarla bien.

<img src="/blog/morcilla-tour-2025/parranda-app-cancionero-list.jpg" alt="Lista del Cancionero" class="phone-screenshot" />

<img src="/blog/morcilla-tour-2025/parranda-app-cancion-detail.jpg" alt="Detalle de Canción" class="phone-screenshot" />

Ya en las parrandas pude aprender el verdadero poder de herramientas como Claude Code Web, que me ayudaron a atender bugs y feedback en vivo sin mucho afán y sobre todo sin perderme la parranda. Desde problemas con el login, issues de UI/UX y hasta añadir canciones nuevas al cancionero. Todo eso lo pude hacer desde mi teléfono a GitHub y de GitHub a producción. El plan original era que las personas se registraran, pero ya al final moví el cancionero para que se pueda acceder desde la pantalla inicial.

### El Workflow: Prompt → PR → Preview → Deploy

Usé **Claude Code** y **Codex** para escribir el 100% del código. El workflow era el siguiente:

1. Escribir un prompt descriptivo con contexto
2. El AI tool genera el código y crea un PR
3. Vercel automáticamente genera un preview URL
4. Testeo en el preview, y regreso al paso 1 hasta que quede satisfecho
5. Merge → Deploy automático

Miremos un ejemplo específico para ver el workflow de cerca.

### Ejemplo: Rediseñando la Navegación

Cuando hice el pivot a web, tuve que repensar el tab navigation ya que no funciona bien cuando es un mobile web app. Este fue el prompt que usé:

> "Use the frontend design skill to rethink the navigation. Remove the tabs and put all of the options in the Home Screen: songbook, parranda events, profile, gallery. Use chrome devtool mcp, run the web version of the app in demo mode so you can see the screen and come up with a solid UI"

El [frontend design skill](https://claude.com/blog/improving-frontend-design-through-skills) de Anthropic ayuda a que el modelo piense mucho mejor los temas de UI. Combinandolo con el uso de **MCP (Model Context Protocol)** — Claude Code puede conectarse a Chrome DevTools para ver la app en vivo mientras hace cambios y piensa sobre el diseño. Esto me permitió iterar sobre el diseño sin tener que describir cada detalle. Claude podía ver lo que yo veía.

Al final de esta sesión, la pantalla principal quedo mucho más limpia con todas las opciones accesibles, optimizada para el uso en las parrandas donde la gente está de pie, con el teléfono en una mano y un güiro en la otra. Así mismo fue el proceso de crear todos los features del app. Pase tiempo pensando sobre la arquitectura, los features y otros detalles importantes de software engineering pero el hands-on coding work fue mayormente hecho por Claude Code.

### Iterando en Vivo Durante las Parrandas

<img src="/blog/morcilla-tour-2025/claude-code-mobile-sessions.jpg" alt="Claude Code Mobile Sessions" class="phone-screenshot" />

Con el release de Claude Code Web la cosa se pone buena. Podía hacer cambios al parranda app desde mi teléfono durante las parrandas. Me propuse atender el feedback de la gente lo más rápido posible, y si podía hacerlo durante la parranda mejor. Claude Code Web fue un palo para esto. Durante el ensayo de las parrandas, mientras el corillo cantaba, yo estaba en una esquina haciendo deploys.

Mira el screenshot de arriba con una lista de sesiones en Claude Code desde el celular. Cada una representa un cambio que hice en vivo:

- **"Add Doña Tere song to songbook"** — Una nueva canción que nos trajo un morcillero nuevo. En 2 minutos estaba en el cancionero.
- **"Add next and previous song navigation"** — En la primera parranda me di cuenta que faltaba este UX para pasar de canción en canción. Otro PR en menos de 15 minutos.
- **"Update house rules title and dancer emoji"** — Detallitos de UX que notas cuando 100 personas usan tu app al mismo tiempo. Como mencioné arriba, es súper importante que las personas que se unan sigan las reglas del Morcilla Tour.

El flow era: alguien me dice algo → abro Claude Code en el iPhone → describo el cambio → Claude hace el PR → Vercel genera preview → verifico que funciona → merge → deploy. Todo en menos de 10 minutos, sin laptop, sin perderme la parranda. Web es mucho más rápido para deploy que un mobile app, y mucho más fácil iterar y hacer cambios. Esto era cierto antes de los LLMs y lo sigue siendo hoy.

Esto es lo que los LLMs habilitan hoy: la capacidad de iterar a la velocidad del feedback. Ya no tienes que esperar a llegar a casa, abrir la laptop, recordar cuál era el bug. Lo resuelves en el momento, con el contexto fresco.

## Próximos Pasos

Antes de las SanSe le voy a añadir todos los coros de plena famosos para que así cualquiera que quiera tocar, cantar y bailar pueda hacerlo. El plan ahora es tener el cancionero más completo de parranda y plena, que sirva de referencia para cualquier grupo de parranda y poder aportar mi granito de arena como mismo lo hizo (y sigue haciendo) Don Herminio. De paso me va a ayudar a mí a poder cantar los coros y no dejarla caer. Tengo otras ideas en mente para parranda.app, pero quizás las deje para el próximo season del Morcilla Tour. La motivación llega sola cuando estás haciendo algo para tus amigos y para la cultura.

---

**¿Tienes tu propio grupo de parranda?** Entra a [parranda.app](https://parranda.app) y usa el cancionero. Está ready para las SanSe, o la próxima fiesta familiar. Si quieres contribuir o tienes feedback, escríbeme.

🎶 **¡El Que Quiera Morcilla, QUE SE LA COMA!** 🎶
