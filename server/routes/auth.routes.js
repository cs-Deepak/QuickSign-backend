import{Router} from "express"

const router = Router();

router.post("/api/v1/auth/google-login", (req, res) =>{
    res.send("Hello Word")
});

export default router;