const jwt = require('jsonwebtoken');

exports.generateToken = (userId, res)=>{
    const token = jwt.sign({userId}, process.env.JWTCODE,{
        expiresIn: '7d'
    });

    res.status(200).json({
        message: "User created",
        success: true,
        token: token
    });
};