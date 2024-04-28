import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mysql from "mysql"
import dotenv  from "dotenv";


const salt = 10;

dotenv.config();
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
  });

    // se adapto de otro sistema y si funciona sino borrar Realiza una consulta a la base de datos (la base de datos le damos el nombre nosostros y creamos la tabla a la cual va a hacer la consulta)
db.query("SELECT 1", (error, results) => {
  // Si no hay error, la conexión es exitosa
  if (!error) {
    console.log("Conexión a la base de datos exitosa");
  } else {
    console.log("Error al conectarse a la base de datos:", error);
  }
  
});


export const home = (req,res) => {
    return res.json({Status: "Success", nombre: req.correo})
  }


//el campo clave hay que definirlo en la BD con mas de 140 caracteres, si es pequeño el campo dara error
export const register = (req, res) => {
  try {
      const sql = "INSERT INTO login (`name`,`email`,`clave`) VALUES (?)";
      bcrypt.hash(req.body.clave.toString(), salt, (err, hash) => {
        if (err) return res.json({error: "Error hashiando el password"})
        const values = [req.body.name, req.body.email, hash];

        db.query(sql, [values], (err, result) => {
            if (err) return res.json({Error: "Error guardando los datos en el servidor"})
            return res.json({Status: "Success"})
          
        })
      })
      
    } catch (error) { 
      console.log(error)
      
    }
  };


 

   export const login = (req, res) => {
    const sql = 'SELECT * FROM login WHERE email = ?';
    db.query(sql, [req.body.email], (err, data) =>{
      if (err) return res.json({Error: "Login error in server"})
      if(data.length>0) {
        bcrypt.compare(req.body.clave.toString(), data[0].clave, (err,response) =>{
          if(err)  return res.json({Error: "Password compare error"})
          if (response) {
            const email= data[0].email
            const accessToken = jwt.sign({email}, "jwt-access-token-secret-key", {expiresIn: '1m'})
            const refreshToken = jwt.sign({email}, "jwt-refresh-token-secret-key", {expiresIn: '5m'})
            res.cookie('accessToken', accessToken, {maxAge: 60000})
            res.cookie('refreshToken', refreshToken, {maxAge: 300000, httpOnly: true, secure: true, sameSite: 'strict'})
            /* return res.json({Status: "Login Success"}) */
            return res.json({Login: true})
          }else{
            return res.json({Error: "Password not matched"})
          }
        })
      }else {
        return res.json({Login: false, message: "No email exist"})
      }
    })
  
  }


  //para validar si el token es valido
  export const verifyUser = (req, res, next) => {
    const accesstoken = req.cookies.accessToken
    if(!accesstoken) {
      if(renewToken(req, res)) {
        next()
      }
    }else {
      jwt.verify(accesstoken, 'jwt-access-token-secret-key', (err, decoded) => {
        if(err) {
          return res.json({valid: true, message: "Token invalido verify"})
        } else {
          req.email = decoded.email
          next()
        }
      })

    }
  }

  //funcion apra renovar token por vencimiento del 1m
  const renewToken = (req, res) => {

    const refreshtoken = req.cookies.refreshToken
    let exist =false
    if(!refreshtoken) {
      return res.json({valid: false, message: "No refresh token"})


    }else {
      jwt.verify(refreshtoken, 'jwt-refresh-token-secret-key', (err, decoded) => {
        if(err) {
          return res.json({valid: true, message: "Invalid refresh token"})
        } else {
          const accessToken = jwt.sign({email: decoded.email}, "jwt-access-token-secret-key", {expiresIn: '1m'})
          res.cookie('accessToken', accessToken, {maxAge: 60000})
          exist = true
        }
      })

    }
    return exist

  }

  export const dashboard = (req,res) => {
    return res.json({valid: true, message: "Authorized"})
  }