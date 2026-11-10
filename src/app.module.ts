import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { createProfileLoaders } from './profiles/profile.loaders';
import { ProfilesModule } from './profiles/profiles.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    PrismaModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      // The driver must be declared on the async module options themselves.
      driver: ApolloDriver,
      imports: [PrismaModule],
      inject: [PrismaService],
      useFactory: (prisma: PrismaService): ApolloDriverConfig => ({
        driver: ApolloDriver,
        autoSchemaFile: true,
        sortSchema: true,
        introspection: true,
        playground: false,
        // Official Apollo embedded Sandbox, accessible at /graphql.
        plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
        // Request-local DataLoaders: no cross-request caching, no N+1 on lists.
        context: () => ({ loaders: createProfileLoaders(prisma) }),
      }),
    }),
    ProfilesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
