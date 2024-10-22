import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({ usernameField: 'email' });
    }

    validate(email: string, password: string) {
        return this.authService.validateUser(email, password);
    }

    // async validate(username: string, password: string): Promise<any> {
    //     const user = await this.authService.validateUser(username, password);
    //     if (!user) {
    //         // Personalize a mensagem de erro aqui
    //         throw new UnauthorizedException('Credenciais inválidas. Por favor, tente novamente.');
    //     }
    //     return user;
    // }


}