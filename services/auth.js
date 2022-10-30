const db = require('./db');

async function login(req,res){
    const {username,password} = req.body
    db.query(`SELECT users.user_id,users.username FROM users WHERE users.username='${username}' AND users.password='${password}'`,res,validateLogin)

}

function validateLogin(rows,response){
    if(rows && rows.length > 0){
        response.status(200).json({data:rows})
    }else{
        response.status(401).json({error:"Falsche Benutzerangaben"})
    }
    
}

module.exports = {
    login
}