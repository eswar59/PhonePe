const jwt  = require("jsonwebtoken");
const JWT_SECRET = require("./config");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({
            message: "Invalid token"
        })
    }

    const token = authHeader.split(" ")[1]; // 2nd element of split array

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.userId) {
            req.userId = decoded.userId;
            next();
        } else {
            return res.status(403).json({
                message: "Invlid token"
            })
        }
    }
    catch (error) {
        return res.status(403).json({
            message: "Invlid token"
        })
    }
};

module.exports = authMiddleware;