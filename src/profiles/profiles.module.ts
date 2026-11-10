import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProfilesResolver } from './profiles.resolver';
import { ProfilesService } from './profiles.service';

@Module({
  imports: [PrismaModule],
  providers: [ProfilesResolver, ProfilesService],
})
export class ProfilesModule {}
