var express=require("express");

var a=express();

var cloudinary=require("cloudinary").v2;

var fileuploader=require("express-fileupload");

a.use(fileuploader());

var mysql=require("mysql2");

let config="mysql://avnadmin:AVNS_EMDLMEESHpTYfD3mM4P@mysql-13392e1b-maheshsingla2006-35f6.k.aivencloud.com:19533/defaultdb";

let db=mysql.createConnection(config);

cloudinary.config({ 
    cloud_name: 'dhu9ri8sd', 
    api_key: '168118847387785', 
    api_secret: 'ybk_9tpruaGf18VizpOjyqGU30U' // Click 'View API Keys' above to copy your API secret
});

db.connect(function(err){
    if(err==null)
        console.log("connected successfully");
    else
        console.log(err.message);
})

a.use(express.static("files"));

a.use(express.urlencoded(true));

a.listen(2024,function(req,resp){
    console.log("server started");
})

// --------------- Index Page ---------------
a.get("/",function(req,resp){
    let path=__dirname+"/files/index.html";
    resp.sendFile(path);
})

a.get("/signup",function(req,resp){
    let email=req.query.txtEmail;
    let pwd=req.query.txtPwd;
    let utype=req.query.utype;

    db.query("insert into users values(?,?,?,current_date(),?)",[email,pwd,utype,1],function(err){
        if(err==null)
        {
            resp.send("Signed up Successfullyyyyy");

        }
        else
            resp.send(err.message)
    })

})

a.get("/login",function(req,resp){
    let email=req.query.txtEmaillog;
    let pwd=req.query.txtPwdlog;
    console.log(email+"  "+pwd);
    
    db.query("select * from users where email=? and pwd=?", [email, pwd], function(err, jsonArray) {
    console.log(jsonArray);
    if (jsonArray.length == 1) {
        resp.send(jsonArray[0]["utype"]);
        console.log(jsonArray[0]["status"]);
    } else {
        resp.send("incorrect credentials");
    }
    })
    
})

// --------------- Profile Organizer Page ---------------
a.get("/organizer",function(req,resp){
    let path=__dirname+"/files/profileorganizer.html";
    resp.sendFile(path);
})

a.post("/savee", async function (req, resp) {
    try {
        if (!req.body.txtmail || req.body.txtmail.trim() === "") {
            return resp.status(400).send("Email is required and cannot be empty.");
        }

        let filename = req.files ? req.files.txtprooffile.name : "nopic.jpg";
        let path = __dirname + "/files/uploads/" + filename;
        req.files.txtprooffile.mv(path);

        await cloudinary.uploader.upload(path).then(function (result) {
            filename = result.url;
        });

        req.body.txtprooffile = filename;

        db.query(
            "INSERT INTO organizations (email, organisation, contact, address, city, proof, sports, prev_tournaments, website, instagram) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                req.body.txtmail,
                req.body.txtorg,
                req.body.txtcontact,
                req.body.txtaddress,
                req.body.txtcity,
                req.body.txtproof,
                req.body.txtsports,
                req.body.txtprev,
                req.body.txtwebsite,
                req.body.txtinsta,
            ],
            function (err) {
                if (err) {
                    console.error("Database error:", err.message);
                    return resp.status(500).send("Database error occurred.");
                }
                resp.send("Profile saved successfully.");
            }
        );
    } catch (err) {
        console.error("Error saving profile:", err);
        resp.status(500).send("An error occurred.");
    }
});

a.post("/updatee",async function(req,resp)
{
    let filename="";
    filename=req.files.txtprooffile.name;
    let path=__dirname+"/files/uploads/"+filename;
    console.log(path);
    req.files.txtprooffile.mv(path);
    await cloudinary.uploader.upload(path).then(function(result){
        filename=result.url;  
        console.log(filename);
    });
        
    req.body.txtprooffile=filename;

    db.query("update organizations set org=?,contact=?,address=?,city=?,idproof=?,ufile=?,sports=?,com=?,web=?,insta=? where email=?",[req.body.txtorg,req.body.txtcontact,req.body.txtaddress,req.body.txtcity,req.body.txtproof,req.body.txtprooffile,req.body.txtsports,req.body.txtprev,req.body.txtwebsite,req.body.txtinsta,req.body.txtmail],function(err)
    {
        if(err==null)
            resp.send("Record Updated Successfully");
        else
            resp.send(err.message); 

    })
})

a.get("/search",function(req,resp)
{
    let email=req.query.txtmail;
    db.query("select * from organizations where emailid=?",[email],function(err,jsonArray)
    {
        if(err!=null)
        {
            resp.send(err.message);
        }
        else
       
            resp.send(jsonArray);
    })
})

// ------------------ Publish Tournaments -----------------------------
a.get("/publish",function(req,resp){
    let path=__dirname+"/files/publish-tournament.html";
    resp.sendFile(path);
})

a.post("/save", async function(req,resp){
    console.log(req.body);
    let filename="";
    if(req.files==null)
    {
        filename="nopic.jpg";
        
    }
    else
    {
        filename=req.files.txtprooffile.name;
        let path=__dirname+"/files/uploads/"+filename;
        req.files.txtprooffile.mv(path);
        await cloudinary.uploader.upload(path).then(function(result){
        filename=result.url;
        console.log(filename);
     });
    }
       req.body.txtprooffile=filename;
       db.query("insert into tournaments values(?,?,?,?,?,current_date(),?,?,?,?,?)",[null,req.body.txtmail,req.body.txtgame,req.body.txttitle,req.body.txtentryfee,req.body.txtcity,req.body.txtlocation,req.body.txtprizes,req.body.txtprooffile,req.body.txtother],function(err){
        if(err==null)
            resp.send("RECORD SENT SUCCESSFULLY....");
        else
        {   
            resp.send(err.message);
        }
       })
})

// --------------- Tournaments Finders ---------------
a.get("/angular",function(req,resp){
    let path=__dirname+"/files/tournaments-finder.html";
    resp.sendFile(path);
})

a.get("/fetch-all-users",function(req,resp)
{
    db.query("select * from tournaments",function(err,jsonArray)
    {
        
        if(err!=null)
        {
            resp.send(err.message);
        }
        else
       
                resp.send(jsonArray);
           
    })

})

a.get("/fetch-cities",function(req,resp)
    {
        db.query("select distinct city from tournaments",function(err,jsonArray)
    {
        if(err!=null)
        {
            resp.send(err.message)
        }
        else
        resp.send(jsonArray)
    })
})

a.get("/fetch-games",function(req,resp)
    {
        db.query("select distinct game from tournaments",function(err,jsonArray)
    {
        if(err!=null)
        {
            resp.send(err.message)
        }
        else
        resp.send(jsonArray)
    })
})

// --------------- Player Details Page ---------------
a.get("/player",function(req,resp){
    let path=__dirname+"/files/player-details.html";
    resp.sendFile(path);
})

a.post("/send", async function(req,resp){
    console.log(req.body);
    let filename="";
    if(req.files==null)
    {
        filename="nopic.jpg";
        
    }
    else
    {
        filename=req.files.txtprooffile.name;
        let path=__dirname+"/files/uploads/"+filename;
        req.files.txtprooffile.mv(path);
        await cloudinary.uploader.upload(path).then(function(result){
        filename=result.url;
        console.log(filename);
     });
    }
       req.body.txtprooffile=filename;
       db.query("insert into players values(?,?,?,?,?,?,?,?,?,?)",[req.body.txtmail,req.body.txtname,req.body.txtgames,req.body.txtmobile,req.body.txtdob,req.body.txtgender,req.body.txtaddress,req.body.txtcity,req.body.txtprooffile,req.body.txtinfo],function(err){
        if(err==null)
            resp.send("RECORD SENT SUCCESSFULLY....");
        else
        {   
            resp.send(err.message);
        }
       })
})

a.post("/modify",async function(req,resp)
{
    let filename="";
    filename=req.files.txtprooffile.name;
    let path=__dirname+"/files/uploads/"+filename;
    console.log(path);
    req.files.txtprooffile.mv(path);
    await cloudinary.uploader.upload(path).then(function(result){
        filename=result.url;  
        console.log(filename);
    });
        
    req.body.txtprooffile=filename;

    db.query("update players set name=?,games=?,mobile=?,dob=?,gender=?,address=?,city=?,idproof=?,otherinfo=? where email=?",[req.body.txtname,req.body.txtgames,req.body.mobile,req.body.txtdob,req.body.txtgender,req.body.txtaddress,req.body.txtcity,req.body.txtprooffile,req.body.txtinfo,req.body.txtmail],function(err)
    {
        if(err==null)
            resp.send("Record Updated Successfully");
        else
            resp.send(err.message); 

    })
})

// --------------- Organizer Dashboard Setting ---------------
a.get("/update-password",function(req,resp){
    let email=req.query.txtemail;
    let pwd=req.query.txtcrntpwd;
    let npwd=req.query.txtnewpwd;
    db.query("update users set pwd=? where emailid=? and pwd=?",[npwd,email,pwd],function(err,result){
        if(err!=null)
        {
            resp.send(err.message);
        }
        else if(result.affectedRows==1)
        {
            resp.send("Password Updated Successfully");
        }
        else
        {
            resp.send("Invalid Current Password");
        }
    })
})

// --------------- Players Dashboard Setting ---------------
a.get("/update-passwords",function(req,resp){
    let email=req.query.txtemail;
    let pwd=req.query.txtcrntpwd;
    let npwd=req.query.txtnewpwd;
    db.query("update users set pwd=? where emailid=? and pwd=?",[npwd,email,pwd],function(err,result){
        if(err!=null)
        {
            resp.send(err.message);
        }
        else if(result.affectedRows==1)
        {
            resp.send("Password Updated Successfully");
        }
        else
        {
            resp.send("Invalid Current Password");
        }
    })
})