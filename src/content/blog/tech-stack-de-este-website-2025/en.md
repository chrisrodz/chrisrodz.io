---
title: 'My Personal Website: From Chaos to Order Coding with AI'
description: 'How I built this website - lessons learned about AI development and the importance of good software engineering practices'
slug: 'tech-stack-de-este-website-2025'
pubDate: 2025-10-28
locale: en
---

## Intro

I built my first website in college when I volunteered to work on the research lab's website. I rewrote it from scratch without looking at the existing code to learn how it was done, one of the first leading indicators of my ability to learn quickly and my self-motivation. This year, with the advances in AI coding tools and perhaps motivated by my daughter's birth, I thought: "great time to build my website." I need a testing ground to learn how to code with AI effectively, and I think there's a lack of people with production shipping experience writing and talking about building with AI. With my experience, I see that it's a good time to ship an MVP of my website and blog.

## The Tech Stack

Right now I'm using Claude Code quite a bit, both at work and personally. I used it to decide on this stack. My idea was to have a fairly lightweight stack for the blog, but one that would allow me to add features to the site that I find interesting for my personal use. I also wanted to choose frameworks I haven't used before, to see what it would be like to learn a new technology with AI's help.

### Frontend: Astro + Pico CSS

I chose the Astro framework after researching with Claude Code because it seems like a good testing ground for what I want from the blog: build and learn by building. Skimming through the docs I saw it was pretty straightforward. I compared it with Hugo, Next.js, and other options. In the end, I went with Astro because I thought it was cool, and you don't need another reason to learn for fun.

Similarly, I chose Pico CSS because the idea is to spend as little time as possible thinking about CSS and styling, and learn something new that isn't Tailwind, but that's a bit more manageable.

Both choices were technologies or frameworks I haven't used before, which for me is motivating because I always like learning new things.

### Backend and Deployment

I didn't have a very complicated backend server in mind. Seeing that Supabase is the choice of a lot of vibe coded apps, I decided to use it too to see how it goes. For now I'm only using it for the database, though I might try some other features in the future. This DB is where I'm tracking my daily coffee, the first vibe engineered feature of this website.

For deployment, I chose Vercel because I see it recommended a lot and wanted to understand how it works. It was extremely simple to set up and I like that it has Preview deployments on each Pull Request automatically. For me, Continuous Delivery is non-negotiable, and so far Vercel has worked well for me.

In both cases I'm on the free tier and the moment they want to charge me is the moment I'll move to another solution.

## Lessons Coding with AI

### The Uncomfortable Truth

**Having an AI Coding Assistant and software development experience doesn't replace reading documentation or substitute good software development practices**.

### From 0 to 1: Fast but Chaotic

Building zero to one was very fast, using the tech stack described above. But even with knowledge, you have to maintain control of all the changes the AI is making and have good software development practices, because otherwise it gets out of control really fast.

For example, I dedicate hours at night to this project and was shipping directly to the main branch. Several times the app broke or something unexpected happened that I couldn't catch during the session with Claude Code, in cases where it would automatically commit and push. Many times I had to manually go in and fix the situation.

AI makes mistakes, but you also make mistakes in the process. An example in my case, I broke the nameserver configuration of my website's DNS config. I've been using chrisrodz.io for my personal email for a long time and in the excitement of seeing the website live, I changed the nameserver to Vercel's and didn't receive emails for several days until I felt something was off and remembered that you never touch the nameservers.

### The Moment of Reflection

I had many situations where, because I didn't know the framework well or didn't plan the change adequately, the AI made extra modifications that I wasn't looking for and didn't understand the functionality I wanted. Once I sent it to production with CI/CD, the rapid changes were reflected immediately. At this point, after announcing it on social media and showing the website to two or three friends and family, I started thinking: ok, I need to take a step back.

I needed to properly configure the project with good practices, tests and everything. As if I were the one writing the code, not as if an AI was writing it. I also have to make Pull Requests and seriously review the code. I can't be pushing directly to main, it doesn't make sense, especially if I want the project to be public and presentable. This way I can feel proud of what I'm doing.

Regarding the technologies I chose, I had to take a step back, read the documentation and really understand these frameworks. Also, participating more actively in the coding sessions would allow me to get a good result and not waste time. Specifically using Plan mode (where the AI creates a detailed plan and asks for approval before writing code). Also changing the approach to smaller changes instead of complete features.

I feel that a lot of time is wasted with AI tools, especially if a session goes off track. It's easier to abandon it and start something new. It's simpler to do a `git reset`, go back and try again. Also, if you don't have good understanding or the plan isn't well made, it gets even more complicated. In conclusion: the magic trick of building a 0 to 1 app from a single prompt is cool, but it doesn't work for continuing to iterate on the code.

## The Current Process

I decided to build in public, so I made my website a public repository. To feel proud of my work, I sat down to read all the code, review the complete Astro documentation and make fundamental changes to the development process.

### Documentation as Foundation

I made sure the repo's README was solid. This is important for humans and also to help the AI understand the project well.

I removed all redundancy between the README and files like AGENTS.md and Claude.md, this was key. Instead of letting the AI generate these super long files, I wrote them by hand with clear and efficient instructions.

Now AGENTS.md is focused on the development process I want the AI to follow in our sessions, critical rules it must follow, and links to other files with more specific documentation.

### From Markdown to GitHub Issues

I also evolved from using Markdown files, which many AI agents move you to use to save the plans they create, to a more battle-tested tool. I moved all work in progress and all ideas I have for the repo to GitHub Issues to be able to track it a bit better and define each issue well before starting to code. As I see it, some sessions will be just for planning and using the AI to properly define what will be done, explore and leave everything written in the GitHub issue. Other sessions will be for actual coding, where I can take a well-defined issue and produce the pull request that closes it. Before I tried to do everything in one sitting and ended up with mixed results.

## Final Reflection

You can see the website code on GitHub now and also see the features I'm thinking of adding to the website in the future in the GitHub issues themselves. I have in mind to improve the coffee diary and add a dashboard of my personal stats. I'm also working on some other apps and other things I hope to show in the future, but for now you can subscribe here to my RSS feed, follow me on social media or [go here](https://chrisrodz.io/cafe) to see my daily coffee diary.

This project has been a reminder that tools evolve, but the fundamental principles of good software development remain. AI coding assistants are incredibly powerful, but they work best when combined with deep stack knowledge, good practices and a solid development process.

I'm excited to see where this project goes and what I can learn along the way. If you're thinking of doing something similar, my advice is: ship fast, but don't be afraid to stop, reflect and improve your process. In the end, it's your project and should reflect the quality level you're comfortable with.

- [GitHub Repo](https://github.com/chrisrodz/chrisrodz.io)
- [RSS feed](https://chrisrodz.io/rss.xml)
- [Social media](https://x.com/chrisrodz35)
- [Coffee diary](https://chrisrodz.io/cafe)
