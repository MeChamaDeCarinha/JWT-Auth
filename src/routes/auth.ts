import { Router } from "express";
import { z } from "zod"
import { prisma } from "../lib/database";
import { errorType } from "../lib/types";
import { compare, hash } from "bcrypt";
import { generateJWT, validateSession } from "../lib/auth";

const router = Router();

router.post("/auth/signin", async (req, res) => {
    const signinSchema = z.object({
        username: z.string({ invalid_type_error: "Username must be a string", required_error: "Username cannot be blank" })
            .min(3, "Username must have at least 3 characters")
            .max(15, "Username must be up to 15 characters"),
        email: z.string({ invalid_type_error: "Email must be a string", required_error: "Email cannot be blank" })
            .email("Invalid email")
            .refine(async (email) => !await prisma.users.findUnique({ where: { email: email } }), "Email already in use"),
        password: z.string({ invalid_type_error: "Password must be a string", required_error: "Password cannot be blank" })
            .min(8, "Password must have at least 8 characters")
            .max(20, "I think more than 20 characters password is a little too much")
            .regex(new RegExp(".*[A-Z].*"), "Password must have at least 1 uppercase character")
            .regex(new RegExp(".*[a-z].*"), "Password must have at least 1 lowercase character")
            .regex(new RegExp(".*\\d.*"), "Password must have at least 1 number")
            .regex(new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\"'|{}\\[\\];:\\\\].*"), "Password must have at least 1 special character")
    })

    const body: z.infer<typeof signinSchema> = req.body;

    const validation = await signinSchema.safeParseAsync(body)

    if(!validation.success) {
        const errors: errorType[] = validation.error.issues.map((issue) => { return { field: issue.path.toString() ?? undefined, message: issue.message } })

        return res.status(400).json({ errors: errors })
    }

    const user = await prisma.users.create({ data: { username: body.username, email: body.email, password: await hash(body.password, 10) } })

    return res.status(200).json({ token: generateJWT(user) })
});

router.post("/auth/login", async (req, res) => {
    const loginSchema = z.object({
        email: z.string({ invalid_type_error: "Email must be a string", required_error: "Email cannot be blank" })
            .email("Invalid email"),
        password: z.string({ invalid_type_error: "Password must be a string", required_error: "Password cannot be blank" })
    })

    const body: z.infer<typeof loginSchema> = req.body;

    const validation = await loginSchema.safeParseAsync(body)

    if(!validation.success) {
        const errors: errorType[] = validation.error.issues.map((issue) => { return { field: issue.path.toString() ?? undefined, message: issue.message } })

        return res.status(400).json({ errors: errors })
    }

    const user = await prisma.users.findUnique({ where: { email: body.email } })
    if(!user || !await compare(body.password, user.password)) return res.status(400).json({ error: "Email or password incorrect" })

    return res.status(200).json({ token: generateJWT(user) })
});

router.post("/auth/validate", async (req, res) => {
    const session = validateSession(req)

    if(!session) return res.status(401).json({ error: "Unauthorized" })

    return res.status(200).json(session)
});

module.exports = router;