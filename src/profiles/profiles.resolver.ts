import { Context, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Profile as DbProfile } from '@prisma/client';
import { ExperienceType, ProfileType, ProjectType, SkillType } from './models';
import { GraphqlContext } from './profile.loaders';
import { ProfilesService } from './profiles.service';

@Resolver(() => ProfileType)
export class ProfilesResolver {
  constructor(private readonly profiles: ProfilesService) {}

  @Query(() => ProfileType, { nullable: true, description: 'Public developer profile' })
  profile() {
    return this.profiles.getPublicProfile();
  }

  @ResolveField(() => [SkillType])
  skills(@Parent() profile: DbProfile, @Context() ctx: GraphqlContext) {
    return ctx.loaders.skills.load(profile.id);
  }

  @ResolveField(() => [ExperienceType])
  experience(@Parent() profile: DbProfile, @Context() ctx: GraphqlContext) {
    return ctx.loaders.experience.load(profile.id);
  }

  @ResolveField(() => [ProjectType])
  projects(@Parent() profile: DbProfile, @Context() ctx: GraphqlContext) {
    return ctx.loaders.projects.load(profile.id);
  }
}
