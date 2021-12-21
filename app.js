var express = require('express');
var path = require('path');
const { title } = require('process');
var app = express();
var fs=require('fs');
const { json } = require('express');
var {MongoClient} = require('mongodb');
var uri = "mongodb+srv://admin:admin@cluster0.pemam.mongodb.net/Users?retryWrites=true&w=majority";
var client = new MongoClient(uri, {useNewUrlParser:true , useUnifiedTopology:true});
var currentUsername = "";
var currentCart = null;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false })); 
app.use(express.static(path.join(__dirname, 'public')));
// async function main(){
  
//   await client.connect();
 
//   client.close();
// }
// main().catch(console.error);

app.get('/' ,(req,res) => {
  res.render('login',{WrongInfo:false});
})
app.get('/books',function(req,res){
  res.render('books');
});
app.get('/boxing',function(req,res){
  res.render('boxing');
});
app.get('/cart',function(req,res){
  res.render('cart',{cart : currentCart});
});
app.get('/galaxy',function(req,res){
  res.render('galaxy');
});
app.get('/home',function(req,res){
  res.render('home');
});
app.get('/iphone',function(req,res){
  res.render('iphone');
});
app.get('/leaves',function(req,res){
  res.render('leaves');
});
app.get('/phones',function(req,res){
  res.render('phones');
});
app.get('/registration',function(req,res){
  res.render('registration',{showAlert:false});
});
app.get('/searchresults',function(req,res){
  res.render('searchresults', {resultArray : []});
});
app.get('/sports',function(req,res){
  res.render('sports');
});
app.get('/sun',function(req,res){
  res.render('sun');
});
app.get('/tennis',function(req,res){
  res.render('tennis');
});
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
    res.render('login',{WrongInfo:false});
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
        currentUsername = user.username;
        currentCart = user.cart;
      }
    })
   if( userExists && req.body.username != "" && req.body.password != ""){
     
     res.render('home');
   }else {
     res.render('login',{WrongInfo:true})
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
   
   
   await client.db('Users').collection('UsersCollection').findOneAndUpdate(
      {username:currentUsername},
      {
        $push: {cart : {itemName : req.body.itemName}}
      }
      );
     currentCart =  await client.db('Users').collection('UsersCollection').findOne({username:currentUsername},{
       cart:1,
       username:0,
       password:0
     });
     currentCart = currentCart.cart;
     console.log(currentCart);
      res.render('home');
    client.close();
  } catch(err){
    console.log(err);
  }
})

app.post("/search", async (req,res) => {
  try {
    await client.connect();
   searchResults = await client.db('Users').collection("Items").find( { $text: { $search: req.body.Search } } ).toArray();
   console.log(searchResults);
   client.close();
   res.render('searchresults', { resultArray : searchResults });
  } catch (err) {
    console.log(err);
  }
})

app.listen(3000);