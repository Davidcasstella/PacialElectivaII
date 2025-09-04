import express from 'express'
import data from './../resources/data.mjs'

const router = express.Router()

router.get('/',(req,res)=>{
  res.render('index.ejs',{"title":"Learning EJS for Dummies","data":data})
})

router.get('/new-pc',(req,res)=>{
  res.render('add-record.ejs',{"title":"Nuevo Registro"})
})

router.post("/",(req,res)=>{
  const {idPc,mark,value,state} = req.body
  const aux = {"id":idPc,"trademark":mark,"value":value,"state":true}

  data.push(aux)
  res.redirect('/')
})

export default router