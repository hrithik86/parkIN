var express=require("express"),
    app=express(),
    bodyParser=require("body-parser"),
    mongoose=require("mongoose"),
    methodOverride=require("method-override");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));

mongoose.connect("mongodb://team_evol:evolution12345@ds247674.mlab.com:47674/parkin");
// mongoose.connect("mongodb://localhost/parkin");

var parkinSchema= new mongoose.Schema({
    email:String
});

var Parkin=mongoose.model("Parkin",parkinSchema);

app.get("/",function(req,res){
        res.render("home.ejs");
});

app.post("/parkin",function(req,res){
    var email=req.body.email;
    var user={
        email:email
    }
    Parkin.create(user,function(err,user){
        if(err){
            console.log(err)
        }
        else{
            res.redirect("/");
        }
    })
})

app.listen(process.env.PORT,function(){
console.log("server started");
});