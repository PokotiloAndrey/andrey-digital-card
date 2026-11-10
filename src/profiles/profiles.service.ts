import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const PUBLIC_PROFILE_ID = 'andrey-pokotilo';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  getPublicProfile() {
    return this.prisma.profile.findUnique({ where: { id: PUBLIC_PROFILE_ID } });
  }
}
