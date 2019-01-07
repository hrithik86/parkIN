var express=require("express"),
    app=express(),
    flash=require("connect-flash"),
    bodyParser=require("body-parser"),
    mongoose=require("mongoose"),
    passportLocalMongoose=require("passport-local-mongoose");
    methodOverride=require("method-override"),
    passport=require("passport"),
    LocalStrategy=require("passport-local"),
    multipart = require('connect-multiparty'),
    cloudinary = require('cloudinary'),
    cors = require('cors');

mongoose.connect("mongodb://team_evol:evolution12345@ds117101.mlab.com:17101/parkin1");    
// mongoose.connect("mongodb://team_evol:evolution12345@ds247674.mlab.com:47674/parkin");
// mongoose.connect("mongodb://localhost/park");

var UserSchema=new mongoose.Schema({
    userename:String,
    password:String
});
UserSchema.plugin(passportLocalMongoose);
var User=mongoose.model("User",UserSchema);

var VehicleSchema=new mongoose.Schema({
    location:String,
});

var Vehicle=mongoose.model("Vehicle",VehicleSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.use(cors());

app.use(require("express-session")({
    secret:"Confidential Info",
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
res.locals.currentUser=req.user;
res.locals.error=req.flash("error");
res.locals.success=req.flash("success");
next();
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
    }

    const multipartMiddleware = multipart();

    app.get("/",function(req,res){
        res.render("home.ejs");
    });

    cloudinary.config({
        cloud_name: 'hrithik',
        api_key: '135272241391855',
        api_secret: 'ngZCJWapvrrYd0W_zxkE_qKfquw'
    });

    app.post('/upload', multipartMiddleware, function(req, res) {
        var location=req.body.location;
        var image=req.body.image;
        Vehicle.create({location:location,},function(err,newVehicle){
            if(err){
                console.log(err)
            }
            else{
                console.log(newVehicle);
            }
        })
        cloudinary.v2.uploader.upload(image,
          {
            ocr: "adv_ocr"
          }, function(error, result) {
              if( result.info.ocr.adv_ocr.status === "complete" ) {
                  res.render("show.ejs",{result:result,image:image});
                // res.send(result.info.ocr.adv_ocr.data[0].textAnnotations[0].description);
              }
          });
      });

app.post("/data",function(req,res){
    
    var location=req.body.location;
    Vehicle.count({location:location},function(err,c){
        if(err){
            console.log(err);
        }
        else{
            res.render("map.ejs",{location:location,c:c});
        }
    });
    
});

app.get("/about",function(req,res){
    res.render("about.ejs");
});
// ====================================================
// AUTH ROUTES
// ====================================================

app.get("/register",function(req,res){
    res.render("register.ejs");
})

app.post("/register",function(req,res){
    var newUser=new User({username:req.body.username});
    User.register(newUser,req.body.password,function(err,user){
        if(err){
          req.flash("error",err.message);  
          return res.render("register.ejs");
        }
        passport.authenticate("local")(req,res,function(){
        //   req.flash("success","Welcome to ParkIN "+ user.username);
          res.redirect("/");
        })
    })
});

app.get("/login",function(req,res){
    res.render("login.ejs");
})

app.post("/login",passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:"/login"
}),function(req,res){
    
});

app.get("/logout",function(req,res){
  req.logout(); 
//   req.flash("success","logged you out");
  res.redirect("/");
});


// ======================================================================






app.listen(process.env.PORT,function(){
console.log("server started");
});
// app.listen(8000,function(){
//     console.log("server has started");
// })