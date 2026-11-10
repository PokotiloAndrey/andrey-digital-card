import { createProfileLoaders } from '../src/profiles/profile.loaders';

// Unit test: multiple GraphQL parents result in one database call per relation,
// and DataLoader returns records in the requested key order.
describe('Profile DataLoaders', () => {
  it('batches skill lookups and preserves profile order', async () => {
    const skill = {
      findMany: jest.fn().mockResolvedValue([
        { id: 's1', profileId: 'p1', name: 'SQL', category: 'Database' },
        { id: 's2', profileId: 'p2', name: 'Python', category: 'Backend' },
      ]),
    };
    const prisma = { skill, experience: { findMany: jest.fn() }, project: { findMany: jest.fn() } };
    const loaders = createProfileLoaders(prisma as never);
    const [p2, p1, p3] = await Promise.all([
      loaders.skills.load('p2'), loaders.skills.load('p1'), loaders.skills.load('p3'),
    ]);
    expect(skill.findMany).toHaveBeenCalledTimes(1);
    expect(skill.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { profileId: { in: ['p2', 'p1', 'p3'] } },
    }));
    expect(p2.map((s) => s.name)).toEqual(['Python']);
    expect(p1.map((s) => s.name)).toEqual(['SQL']);
    expect(p3).toEqual([]);
  });

  it('caches repeated loads inside one request', async () => {
    const skill = { findMany: jest.fn().mockResolvedValue([]) };
    const prisma = { skill, experience: { findMany: jest.fn() }, project: { findMany: jest.fn() } };
    const loaders = createProfileLoaders(prisma as never);
    await loaders.skills.load('same');
    await loaders.skills.load('same');
    expect(skill.findMany).toHaveBeenCalledTimes(1);
  });
});
