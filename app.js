var express = require('express');
var path = require('path');
const { title } = require('process');
var app = express();
var fs=require('fs');
const { json } = require('express');
var {MongoClient} = require('mongodb');
var uri = "mongodb+srv://admin:admin@cluster0.pemam.mongodb.net/Users?retryWrites=true&w=majority";
var client = new MongoClient(uri, {useNewUrlParser:true , useUnifiedTopology:true});
var items = [
  {itemName:"Galaxy S21 Ultra"},{itemName:"iPhone 13 Pro"},{itemName:"Leaves of Grass"},{itemName:
    "The Sun and Her Flowers"},{itemName:"Boxing Bag"},{itemName:
      "Tennis Racket"}]
var session = require('express-session');




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false })); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret:"secret-key",
  resave:true,
  saveUninitialized:true
}));
// async function main(){
  
//   await client.connect();
 
//   client.close();
// }
// main().catch(console.error);

app.get('/' ,(req,res) => {
  res.render('login',{WrongInfo:false,RegSuccess:false});
})
app.get('/books',function(req,res){
  if(req.session.username){
  res.render('books');
  }
  else{
    res.write("Please login first");
  }
});
app.get('/boxing',function(req,res){
  if(req.session.username){
    res.render('boxing');
    }
    else{
      res.write("Please login first");
    }});
app.get('/cart',function(req,res){
  if(req.session.username){
    res.render('cart',{cart:req.session.cart});
    }
    else{
      res.write("Please login first");
    }});
app.get('/galaxy',function(req,res){
  if(req.session.username){
    res.render('galaxy');
    }
    else{
      res.write("Please login first");
    }});
app.get('/home',function(req,res){
  if(req.session.username){
    res.render('home',{duplicate:false});
    }
    else{
      res.write("Please login first");
    }});
app.get('/iphone',function(req,res){
  if(req.session.username){
    res.render('iphone');
    }
    else{
      res.write("Please login first");
    }});
app.get('/leaves',function(req,res){
  if(req.session.username){
    res.render('leaves');
    }
    else{
      res.write("Please login first");
    }});
app.get('/phones',function(req,res){
  if(req.session.username){
    res.render('phones');
    }
    else{
      res.write("Please login first");
    }});
app.get('/registration',function(req,res){
  res.render('registration',{showAlert:false});
});
app.get('/searchresults',function(req,res){
  if(req.session.username){
    res.render('searchresults');
    }
    else{
      res.write("Please login first");
    }});
app.get('/sports',function(req,res){
  if(req.session.username){
    res.render('sports');
    }
    else{
      res.write("Please login first");
    }});
app.get('/sun',function(req,res){
  if(req.session.username){
    res.render('sun');
    }
    else{
      res.write("Please login first");
    }});
app.get('/tennis',function(req,res){
  if(req.session.username){
    res.render('tennis');
    }
    else{
      res.write("Please login first");
    }});
app.post('/register', async (req,res) => {
  try{
  await client.connect();
  let existingUsers = await client.db('Users').collection('UsersCollection').find().toArray();
  console.log(existingUsers);
  let alreadyExisting = false;
  existingUsers.forEach(user => {
    if(user.username == req.body.username)
      alreadyExisting = true;
  });
  if(!alreadyExisting && req.body.username != "" && req.body.password != ""){
    await client.db('Users').collection('UsersCollection').insertOne({...req.body,...{cart:[]}});
    res.render('login',{WrongInfo:false, RegSuccess:true});
  }else{
    res.render('registration', {showAlert:true});
  }
  client.close();
} catch(err){
  console.log(err);
}
});
app.post('/login', async (req,res)=> {
  try{
    await client.connect();
    let UsersArray = await client.db('Users').collection('UsersCollection').find().toArray();
    console.log(UsersArray);
    let userExists = false;
    UsersArray.forEach(user => {
      if(user.username.toLowerCase() == req.body.username.toLowerCase() && user.password == req.body.password){
        userExists = true;
        req.session.username = user.username;
        req.session.cart = user.cart;
      }
    })
   if( userExists && req.body.username != "" && req.body.password != ""){
     
     res.render('home',{duplicate:false});
   }else {
     res.render('login',{WrongInfo:true,RegSuccess:false})
   }
    // if(!alreadyExisting){
    //   await client.db('Users').collection('UsersCollection').insertOne(req.body);
    //   res.render('login');
    // }else{
    //   res.render('registration', {showAlert:true});
    // }
    client.close();
  } catch(err){
    console.log(err);
  }
})

app.post('/addToCart', async (req,res)=> {
  try{
   await client.connect();
   oldCart = await client.db('Users').collection("UsersCollection").findOne({username:req.session.username},{cart:1,username:0,password:0});
   oldCart = oldCart.cart;
   dup = false;
   console.log(oldCart);
   console.log(req.body.itemName);
   for (let i = 0;i<oldCart.length;i++) {
     if(oldCart[i].itemName == req.body.itemName){
       dup = true;
     }
   }
   if(!dup){
   await client.db('Users').collection('UsersCollection').findOneAndUpdate(
      {username:req.session.username},
      {
        $push: {cart : {itemName : req.body.itemName}}
      }
      );
      req.session.cart = await client.db('Users').collection("UsersCollection").findOne({username:req.session.username},{cart:1,username:0,password:0});
     req.session.cart = req.session.cart.cart;
      
    }
    res.render('home',{duplicate:dup});
    client.close();
  } catch(err){
    console.log(err);
  }
})

app.post("/search", async (req,res) => {
  try {
   let searchResults = [];
   items.forEach( (item) => {
      if(item.itemName.includes(req.body.Search)){
        searchResults.push(item);
      }
   });
   console.log(searchResults);
   client.close();
   res.render('searchresults', { resultArray : searchResults });
  } catch (err) {
    console.log(err);
  }
})


if(process.env.PORT){
  app.listen(process.env.PORT, function(){console.log("Server Started")});
}
else{

  app.listen(3000, function(){console.log("Server started on port 3000")});
  
}
