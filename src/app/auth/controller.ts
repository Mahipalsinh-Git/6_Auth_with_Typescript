import { createHmac, randomBytes } from "node:crypto";

import type { Request, Response } from "express";
import { eq } from "drizzle-orm";

import { signInPayloadModel, singupPayloadModel } from "./models.js";
import db from "../../db/index.js";
import { usersTable } from "../../db/schema.js";

class AuthenticationController {
  public async handleSignup(req: Request, res: Response) {
    const validationResult = await singupPayloadModel.safeParseAsync(req.body);

    if (validationResult.error)
      return res.status(400).json({
        message: "body validation failed",
        error: validationResult.error.issues,
      });

    const { firstName, lastName, email, password } = validationResult.data;

    const userEmailResult = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (userEmailResult.length > 0)
      return res.status(400).json({
        error: "duplicate entry",
        message: `user with email ${email} already exists`,
      });

    const salt = randomBytes(32).toString("hex");
    const hash = createHmac("sha256", salt).update(password).digest("hex");

    const [result] = await db
      .insert(usersTable)
      .values({
        firstName,
        lastName,
        email,
        password: hash,
        salt,
      })
      .returning({ id: usersTable.id });

    return res
      .status(201)
      .json({ message: "user created ", data: { id: result?.id } });
  }

  public async handleSignIn(req: Request, res: Response) {
    const validationResult = await signInPayloadModel.safeParseAsync(req.body);

    if (validationResult.error)
      return res.status(400).json({
        message: "body validation failed",
        error: validationResult.error.issues,
      });

    const { email, password } = validationResult.data;

    const [userSelect] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!userSelect) return res.status(404).json({ message: "user not found" });

    const salt = userSelect.salt;
    const hash = createHmac("sha256", salt!).update(password).digest("hex");

    if (userSelect.password != hash)
      return res
        .status(400)
        .json({ message: "email or password is incorrect" });

    // TODO: create token

    return res.json({ message: "login successfully", data: { userSelect } });
  }
}

export default AuthenticationController;
