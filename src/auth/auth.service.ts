import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { UnauthorizedError } from './errors/unauthorized.error';
//import { UserPayload } from './userFromJwtModels/UserPayload';
//import { UserToken } from './UserFromJwtmodels/UserToken';
import { UserPayload } from './models/UserPayload';
import { UserToken } from './models/UserToken';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
    ) { }

    async login(user: User): Promise<UserToken> {
        const payload: UserPayload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            cod: user.cod,
        };

        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.userService.findByEmail(email);

        if (user) {
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid) {
                return {
                    ...user,
                    password: undefined,
                };
            }
        }

        throw new UnauthorizedError(
            'O endereço de e-mail ou a senha fornecidos estão incorretos.',
        );
    }
}