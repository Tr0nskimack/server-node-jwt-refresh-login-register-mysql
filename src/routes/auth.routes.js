import {Router} from "express"
import {home, register, login, dashboard, verifyUser} from "../controllers/auth.controllers.js";





const router = Router()


router.get("/", home)
router.post("/register", register)

router.post("/login", login)

router.get("/dashboard", verifyUser, dashboard)



export default router;