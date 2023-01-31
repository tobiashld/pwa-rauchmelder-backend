const db = require('./db');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const bcrypt = require("bcrypt")
const {jwtDecode} = require('jwt-decode')

// get config vars
dotenv.config();


async function login(req,res){
    const {username,password} = req.body
    db.query(`SELECT * FROM users WHERE username='${username}'`,res,(row,response)=>validateLogin(row,req,response))

}
async function signup(req,res){
    const {username,password} = req.body
    let hashedPassword = await bcrypt.hash(password, 10);
    db.query(`INSERT INTO public.users ("username", "password", "admin","salt") VALUES ('${username}', '${hashedPassword}', false,'10');`,res)
}
async function changepw(req,res){
    const {password} = req.body
    let hashedPassword = await bcrypt.hash(password, 10);
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    let payload = parseJwt(token)
    query = `UPDATE public.users SET password='${hashedPassword}' WHERE user_id=${payload.id};`
    db.query(query,res)
}

function parseJwt (token) {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

function getOwnUser(req,res){
    const {accessToken,refreshToken} = req.cookies
    
    if(refreshToken){
        let user = jwt.decode(refreshToken)
        res.status(200).json({status:200,data:user})
    }else{
        res.status(200).json({status:420,error:"No Token"})
    }

}

function validateLogin(rows,request,response){
    const {username,password} = request.body
    if(rows && rows.length > 0 ){
        bcrypt.compare(password,rows[0].password).then(isSame=>{
            if(isSame){
                let newAccessToken = generateAccessToken({username:rows[0].username,id:rows[0].user_id})
                response
                    .status(200)
                    
                    .cookie('accessToken', newAccessToken, {
                        expires: new Date(new Date().getTime() + 60*60 * 1000),
                        httpOnly: true,
                        sameSite:'none',
                        secure:true
                    })
                    .cookie('refreshToken', generateRefreshToken({username:rows[0].username,id:rows[0].user_id}), {
                        expires: new Date(new Date().getTime() + 172800*1000),
                        httpOnly: true,
                        sameSite:'none',
                        secure:true
                    })
                    .json({status:200,token:newAccessToken})
            }else{
                response.status(401).json({error:"Falsches Passwort"})
            }
        })
    }else{
        response.status(401).json({error:"Falscher Benutzername"})
    }
    
}


function authenticateToken(req, res, next) {
  
  const {accessToken,refreshToken} = req.cookies

  

  jwt.verify(accessToken?accessToken:"", process.env.TOKEN_SECRET , (err, user) => {

    if (err) {
        if (refreshToken == null) return res.status(200).json({status:469,error:"Beide Token abgelaufen!"})
        let payload = jwt.decode(refreshToken)
        let newAccessToken = generateAccessToken({username:payload.username,id:payload.id})
        res
            .cookie('accessToken', newAccessToken, {
				expires: new Date(new Date().getTime() + 60*60*1000),
				httpOnly: true
			})
    }

    req.user = user

    next()
  })
}

async function handleRefreshToken(req, res) {
    const {accessToken,refreshToken} = req.cookies
    
    if (refreshToken == null) return res.status(200).json({status:400,error:"Session abgelaufen"})
    jwt.verify(refreshToken, process.env.TOKEN_SECRET , (err, payload) => {
      if (err) {
        res.status(200).json({status:400,error:"Session abgelaufen"})
      }else{
        
        let newAccessToken = generateAccessToken({username:payload.username,id:payload.id})
        let expiresIn = new Date()
        expiresIn.setTime(payload.exp)
        res
            .status(200)
            .cookie('accessToken', newAccessToken, {
				expires: new Date(new Date().getTime() + 60*60*1000),
				httpOnly: true
			})
            .json({status:200,token:newAccessToken})
      }
    })
  }



function generateAccessToken(data) {
    return jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn: 60*60 });
}
function generateRefreshToken(data) {
    return jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn: 172800 });
}

  
module.exports = {
    login,
    signup,
    authenticateToken,
    getOwnUser,
    generateAccessToken,
    handleRefreshToken,
    changepw
}