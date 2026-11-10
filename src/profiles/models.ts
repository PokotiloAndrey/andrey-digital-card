import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SkillType {
  @Field() id!: string;
  @Field() name!: string;
  @Field() category!: string;
}

@ObjectType()
export class ExperienceType {
  @Field() id!: string;
  @Field() company!: string;
  @Field() position!: string;
  @Field() period!: string;
  @Field() achievements!: string;
}

@ObjectType()
export class ProjectType {
  @Field() id!: string;
  @Field() name!: string;
  @Field() description!: string;
  @Field(() => String, { nullable: true }) url!: string | null;
}

@ObjectType()
export class ProfileType {
  @Field() id!: string;
  @Field() name!: string;
  @Field() description!: string;
  @Field() githubUrl!: string;
  @Field(() => String, { nullable: true }) portfolioUrl!: string | null;
  // Resolved only when requested; batched at request scope.
  @Field(() => [SkillType]) skills!: SkillType[];
  @Field(() => [ExperienceType]) experience!: ExperienceType[];
  @Field(() => [ProjectType]) projects!: ProjectType[];
}
