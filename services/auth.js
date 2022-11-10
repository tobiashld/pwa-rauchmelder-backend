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

function validateLogin(rows,request,response){
    const {username,password} = request.body
    if(rows && rows.length > 0 ){
        bcrypt.compare(password,rows[0].password).then(isSame=>{
            if(isSame){
                response.status(200).json({status:200,token:generateAccessToken({username:rows[0].username,id:rows[0].user_id})})
            }else{
                response.status(401).json({error:"Falsches Passwort"})
            }
        })
    }else{
        response.status(401).json({error:"Falscher Benutzername"})
    }
    
}


function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.TOKEN_SECRET , (err, user) => {

    if (err) {
        return res.status(403).json({error:"Session abgelaufen"})
    }

    req.user = user

    next()
  })
}
function generateAccessToken(data) {
    return jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn: '5400s' });
  }

  
module.exports = {
    login,
    signup,
    authenticateToken,
    generateAccessToken,
    changepw
}