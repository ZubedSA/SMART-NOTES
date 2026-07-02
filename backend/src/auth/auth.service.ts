import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async login(email: string, pass: string) {
    // Ambil data user langsung dari database PostgreSQL via Prisma
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Validasi password menggunakan bcrypt
    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Role mapping: mendukung nama role langsung
    let roleName = 'Viewer';
    let roleId = 'ROLE-4';

    const rawRole = (user.role || '').toUpperCase();
    if (rawRole.includes('ADMIN') || rawRole.includes('ROLE-1')) {
      roleName = 'Admin';
      roleId = 'ROLE-1';
    } else if (rawRole.includes('MANAGER') || rawRole.includes('ROLE-2')) {
      roleName = 'Manager';
      roleId = 'ROLE-2';
    } else if (rawRole.includes('STAFF') || rawRole.includes('ROLE-3')) {
      roleName = 'Staff';
      roleId = 'ROLE-3';
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      roleId: roleId,
      roleName: roleName,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_jwt_key_2026',
      expiresIn: '7d',
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: roleId,
        roleName: roleName,
        phone: user.phone || '',
        avatar: '',
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_jwt_key_2026',
      });
      const payload = {
        sub: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        roleId: decoded.roleId,
        roleName: decoded.roleName,
      };
      return {
        accessToken: this.jwtService.sign(payload, { expiresIn: '1d' }),
      };
    } catch (e) {
      throw new UnauthorizedException('Refresh token tidak valid atau kadaluwarsa');
    }
  }
}
