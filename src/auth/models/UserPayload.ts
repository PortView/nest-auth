export interface UserPayload {
    sub: number;
    email: string;
    name: string;
    cod: number;
    iat?: number;
    exp?: number;
}