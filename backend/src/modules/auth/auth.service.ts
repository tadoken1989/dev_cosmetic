import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { User } from './entities/user.entity'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(userId: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id: userId } })
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    })

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng')
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    )

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng')
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Tài khoản đã bị khóa')
    }

    // Update last login
    user.lastLoginAt = new Date()
    await this.usersRepository.save(user)

    const payload = { sub: user.id, email: user.email, role: user.role }
    const token = this.jwtService.sign(payload)

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        branchId: user.branchId,
      },
    }
  }

  async getCurrentUser(userId: number) {
    const user = await this.validateUser(userId)
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng')
    }
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      branchId: user.branchId,
    }
  }
}

