import DataLoader from 'dataloader';
import { Experience, Project, Skill } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type OwnedRow = { profileId: string };

/**
 * A new set of loaders is created for every GraphQL request. Batched queries
 * preserve key order and never share cached records across requests.
 */
export function createProfileLoaders(prisma: Pick<PrismaService, 'skill' | 'experience' | 'project'>) {
  async function byProfileId<T extends OwnedRow>(
    ids: readonly string[],
    fetch: (ids: string[]) => Promise<T[]>,
  ): Promise<T[][]> {
    const rows = await fetch([...ids]);
    const index = new Map<string, T[]>();
    for (const id of ids) index.set(id, []);
    for (const row of rows) index.get(row.profileId)?.push(row);
    return ids.map((id) => index.get(id) ?? []);
  }

  return {
    skills: new DataLoader<string, Skill[]>(
      (ids) => byProfileId(ids, (keys) => prisma.skill.findMany({
        where: { profileId: { in: keys } }, orderBy: [{ category: 'asc' }, { name: 'asc' }],
      })),
    ),
    experience: new DataLoader<string, Experience[]>(
      (ids) => byProfileId(ids, (keys) => prisma.experience.findMany({
        where: { profileId: { in: keys } }, orderBy: { id: 'asc' },
      })),
    ),
    projects: new DataLoader<string, Project[]>(
      (ids) => byProfileId(ids, (keys) => prisma.project.findMany({
        where: { profileId: { in: keys } }, orderBy: { id: 'asc' },
      })),
    ),
  };
}

export type ProfileLoaders = ReturnType<typeof createProfileLoaders>;
export interface GraphqlContext {
  loaders: ProfileLoaders;
}
