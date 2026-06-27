import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GoogleBridgeService } from '../google-bridge/google-bridge.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly bridge: GoogleBridgeService,
  ) {}

  async login(email: string, pass: string) {
    const res = await this.bridge.get('Users', { filterKey: 'email', filterValue: email });
    const users = res.data?.items || [];
    let user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

    // Fallback development users jika belum ada di database spreadsheet
    if (!user) {
      if (email === 'admin@smart.id' && pass === 'password123') {
        user = { id: 'USR-1', email: 'admin@smart.id', name: 'Administrator', role_id: 'ROLE-1', phone: '081234567890' };
      } else if (email === 'manager@smart.id' && pass === 'password123') {
        user = { id: 'USR-2', email: 'manager@smart.id', name: 'Manager Rapat', role_id: 'ROLE-2', phone: '081298765432' };
      } else if (email === 'staff@smart.id' && pass === 'password123') {
        user = { id: 'USR-3', email: 'staff@smart.id', name: 'Staff Lapangan', role_id: 'ROLE-3', phone: '081311223344' };
      }
    }

    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Validasi password: pencocokan tepat jika diset, atau fallback ke default 'password123' jika kolom password di database kosong/legacy
    const expectedPassword = user.password || 'password123';
    if (pass !== expectedPassword) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Role mapping: mendukung role_id (legacy) dan role (baru dari Master Data)
    let roleName = 'Viewer';
    let roleId = user.role_id || 'ROLE-4';

    const rawRole = (user.role || user.role_id || '').toString().toUpperCase();
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
        avatar: user.avatar || '',
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
