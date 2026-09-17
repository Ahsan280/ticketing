import { currentUser } from "@ah-tickets/common";
import { Router } from "express";
// import { currentUser } from "../middlewares/current-user";
import { Request, Response } from "express";
const router = Router();

router.get(
  "/api/users/current-user",
  currentUser,
  (req: Request, res: Response) => {
    res.send({ currentUser: req.currentUser || null });
  },
);

export { router as currentUserRouter };
