import { HmacSHA512 } from "crypto-js"
import { Request } from "express"

const JWT_SECRET = process.env.JWT_SECRET

type userDataType = {
    id: string,
    username: string
    email: string
}

type headerType = {
    algorithm: string,
    type: string,
}

type payloadType = {
    id: string,
    username: string,
    email: string,
    expiredAt: string,
}

export function generateJWT(user: userDataType): string {
    var expiredAt = new Date();
    expiredAt.setMonth(expiredAt.getMonth() + 1)

    const headers: headerType = {
        algorithm: "HS512",
        type: "JWT",
    }

    const payload: payloadType = {
        id: user.id,
        username: user.username,
        email: user.email,
        expiredAt: expiredAt.getTime().toString(),
    }

    const headersBase64 = btoa(JSON.stringify(headers)).replaceAll("=", "")
    const payloadBase64 = btoa(JSON.stringify(payload)).replaceAll("=", "")
    
    const tokenEncoded = HmacSHA512(headersBase64 + "." + payloadBase64, JWT_SECRET!).toString()

    return headersBase64 + "." + payloadBase64 + "." + tokenEncoded
}

export function validateJWT(JWT: string): boolean {
    const parts = JWT.split(".")

    const headers = parts[0]
    const payload = parts[1]
    const tokenEncoded = HmacSHA512(headers + "." + payload, JWT_SECRET!).toString()

    return parts[2] === tokenEncoded
}

export function validateSession(request: Request): payloadType | null {
    const authorization = request.headers.authorization
    if(!authorization) return null

    const JWT = authorization.split(" ")[1]
    if(!validateJWT(JWT)) return null

    const payload: payloadType = JSON.parse(atob(JWT.split(".")[1]))
    
    const currentDate = new Date().getTime()
    const expiredAt = parseInt(payload.expiredAt)
    
    if(currentDate > expiredAt) return null
    
    return payload
}