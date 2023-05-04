
require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const { time } = require('console');

const IN_PROD = process.env.NODE_ENV === 'production'
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.set('view engine', 'ejs')
app.use(session({
  secret:process.env.SECRETKEY ,
  resave: true,
  saveUninitialized: true,
  cookie:{
    secure:IN_PROD,
    httpOnly:false,
    maxAge:36000         
  }

}))





mongoose.set('strictQuery', false);
main().catch((err) => console.log(err));

async function main () {

  await  mongoose.connect('mongodb://127.0.0.1:27017/todolist4');

  //   tdl means Todo List
  const tdlSchema = new mongoose.Schema({
    Content:String,
  })

  const tdl = new mongoose.model('tdl', tdlSchema);

  
  app.get('/', function(request, response){
    response.render('home');
  })

  app.get('/todo', function(request, response){
    const session = request.session.id
    console.log(session);
    // response.send("hello");
    
    tdl.find({}, function(err, result){
      if (err){
        console.log(err)
      }else if(result.length === 0){
       
        const newToDo = new tdl({
          
          Session:{
            session:session,
            Content:[]  
          }
        })

        newToDo.save();
        response.render('todolist', {results:result});
        console.log(result);
      }else{
        response.render('todolist', {results:result.Content});
      }
    })
    
  })

  
  app.post('/todo', async function(request, response){
    const currentUser = request.session.id
    const add = request.body.add
    console.log(currentUser)
    const todo = request.body.todo;
    if (request.body.checkboxer){
      await tdl.findByIdAndRemove({_id:request.body.checkboxer}, function(err){
        if (err) {
          console.log(err)
        }else{
          console.log('deleted!')
          response.redirect('/todo');
        }
      })
    }else if(add){
      await tdl.findOneAndUpdate({Session:{sessioncurrentUser}}, {$push:{"Session.Content":todo}}, function(err, result){
        if(err){
          console.log(err)
        }else{
          console.log(result)
          response.redirect("/todo")
        }
      })
      
      
    }
  })



  app.listen(process.env.PORT || 3000 , function(){
      console.log('Listening on 3000!!')
  })
}

