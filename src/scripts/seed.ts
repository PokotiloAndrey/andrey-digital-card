import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const profileId = 'andrey-pokotilo';

async function main(): Promise<void> {
  // Idempotent deterministic seed. No made-up employers or experience dates.
  await db.$transaction(async (tx) => {
    await tx.profile.upsert({
      where: { id: profileId },
      create: {
        id: profileId,
        name: 'Андрей Покотило',
        description: 'Python/backend-разработчик. API, PostgreSQL, CRM-интеграции, автоматизация аналитики и прикладные LLM-системы. Изучаю TypeScript и NestJS.',
        githubUrl: 'https://github.com/PokotiloAndrey',
        portfolioUrl: 'https://github.com/PokotiloAndrey/engineering-portfolio',
      },
      update: {
        name: 'Андрей Покотило',
        description: 'Python/backend-разработчик. API, PostgreSQL, CRM-интеграции, автоматизация аналитики и прикладные LLM-системы. Изучаю TypeScript и NestJS.',
        githubUrl: 'https://github.com/PokotiloAndrey',
        portfolioUrl: 'https://github.com/PokotiloAndrey/engineering-portfolio',
      },
    });

    const skills = [
      ['python', 'Python', 'Backend'],
      ['sql', 'SQL / PostgreSQL', 'Database'],
      ['fastapi', 'FastAPI', 'Backend'],
      ['api', 'REST API / webhooks', 'Integrations'],
      ['docker', 'Docker / Docker Compose', 'Infrastructure'],
      ['git', 'Git / GitLab CI/CD', 'Infrastructure'],
      ['llm', 'LLM / ChatGPT / Codex', 'AI'],
      ['typescript', 'TypeScript / NestJS (учебный проект)', 'Learning'],
    ] as const;
    for (const [id, name, category] of skills) {
      await tx.skill.upsert({
        where: { id },
        create: { id, name, category, profileId },
        update: { name, category, profileId },
      });
    }

    await tx.experience.upsert({
      where: { id: 'project-practice-2026' },
      create: {
        id: 'project-practice-2026', profileId,
        company: 'Проектная работа: Streamer Academy / Web Track',
        position: 'Python / Integrations / Analytics (проектные задачи)',
        period: '2026 (проектная работа; точные даты по запросу)',
        achievements: 'Интеграции CRM и API, обработка событий, сверка источников данных, автоматизация отчётности и проверок.',
      },
      update: {
        company: 'Проектная работа: Streamer Academy / Web Track',
        position: 'Python / Integrations / Analytics (проектные задачи)',
        period: '2026 (проектная работа; точные даты по запросу)',
        achievements: 'Интеграции CRM и API, обработка событий, сверка источников данных, автоматизация отчётности и проверок.',
      },
    });
    const projects = [
      {
        id: 'a-sneaker-store',
        name: 'Sneaker Store',
        description: 'Telegram-commerce проект: FastAPI, PostgreSQL, Redis, каталог, заказы, платежи, управление остатками. Публичный репозиторий без приватных данных.',
        url: 'https://github.com/PokotiloAndrey/sneaker-store-open',
      },
      {
        id: 'b-engineering-portfolio',
        name: 'Engineering Portfolio',
        description: 'Учебно-демонстрационные примеры на основе рабочих задач: обработка событий, CRM, аналитика и проверки LLM-результатов.',
        url: 'https://github.com/PokotiloAndrey/engineering-portfolio',
      },
      {
        id: 'c-ai-churn',
        name: 'AI Churn Analysis',
        description: 'Проектная LLM-система анализа активности и CRM-диалогов с проверкой доказательств и защитой от дублирующихся действий. Исходный рабочий репозиторий не публичный.',
        url: null,
      },
    ];
    for (const project of projects) {
      await tx.project.upsert({
        where: { id: project.id },
        create: { ...project, profileId },
        update: { ...project, profileId },
      });
    }
  });
  console.log('Seed completed: profile, skills, experience and projects are ready.');
}

main().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exitCode = 1;
}).finally(async () => {
  await db.$disconnect();
});
