var express=require("express");

var a=express();

var cloudinary=require("cloudinary").v2;

var fileuploader=require("express-fileupload");

a.use(fileuploader());

a.use(express.json());

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
            resp.send("Email already registered. Please login or use another email");
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
    console.log(req.body);

    // Always convert sports to a string
    let sports = req.body.txtsports || req.body['txtsports[]'];
    if (Array.isArray(sports)) {
        sports = sports.join(",");
    } 
    else if (typeof sports === "undefined" || sports === null) {
        sports = "";
    }

    let filename = "";
    if (!req.files || !req.files.txtprooffile) {
        filename = "nopic.jpg";
        req.body.txtprooffile = filename;
        insertOrg();
    } 
    else {
        filename = req.files.txtprooffile.name;
        let path = __dirname + "/files/uploads/" + filename;
        req.files.txtprooffile.mv(path, async function (err) {
            if (err) {
                console.error("File upload error:", err);
                return resp.status(500).send("File upload error: " + err.message);
            }
            await cloudinary.uploader.upload(path).then(function(result){
                filename = result.url;
                req.body.txtprooffile = filename; // <-- Set Cloudinary URL
                insertOrg();
            });
        });
        return; // Wait for async upload
    }

    function insertOrg() {
        db.query("insert into organizations values(?,?,?,?,?,?,?,?,?,?,?)",[req.body.txtmail, req.body.txtorg, req.body.txtcontact, req.body.txtaddress, req.body.txtcity, req.body.txtprooffile, req.body.txtproof, sports, req.body.txtprev, req.body.txtwebsite, req.body.txtinsta ], function (err) {
                if (err == null)
                    resp.send("Profile saved successfully.");
                else
                    resp.send(err.message);
            }
        )}
})

a.post("/updatee", function (req, resp) {

    let sports = req.body.txtsports;
    if (Array.isArray(sports)) {
        sports = sports.join(",");
    }

    let filename = "";
    if (!req.files || !req.files.txtprooffile) {
        filename = req.body.txtprooffile || "nopic.jpg";
        updateDB();
    } else {
        filename = req.files.txtprooffile.name;
        let path = __dirname + "/files/uploads/" + filename;
        req.files.txtprooffile.mv(path, function (err) {
            if (err) {
                console.error("File upload error:", err);
            }
            cloudinary.uploader.upload(path, function (error, result) {
                if (error) {
                    console.error("Cloudinary error:", error);
                }
                filename = result.url;
                updateDB();
            });
        });
        return; 
    }

    function updateDB() {
        req.body.txtprooffile = filename;
        db.query("update organizations set organisation=?,contact=?,address=?,city=?,prooffile=?,proof=?,sport=?,preview=?,website=?,insta=? where email=?",[req.body.txtorg, req.body.txtcontact, req.body.txtaddress, req.body.txtcity, req.body.txtprooffile, req.body.txtproof, sports, req.body.txtprev, req.body.txtwebsite, req.body.txtinsta, req.body.txtmail],function (err, result) {
                if (err) {
                    console.error("DB Update Error:", err);
                }
                if (result.affectedRows === 0) {
                    return resp.status(404).send("No record found to update.");
                }
                resp.send("Record Updated Successfully");
            }
        )}
})

a.get("/search", function(req, resp) {
    let email = req.query.txtmail;
    console.log("Searching for email:", email); // Add this line
    db.query("SELECT * FROM organizations WHERE email = ?", [email], function(err, results) {
        if (err) {
            console.error("DB error:", err);
        }
        resp.json(results);
    });
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