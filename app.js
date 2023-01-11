/*jshint browser:true */

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://Rana619:Rana@1702@cluster0.lzo1o.mongodb.net/toDoList",{ useUnifiedTopology: true , useNewUrlParser: true  });


const personSchema = new mongoose.Schema({
    userName : {type: String},
    PassW : {type: String},
});

const groupOfListSchema = new mongoose.Schema({
    userID : { type: String},
    listTitel : { type: String}
});

const listItemSchema = new mongoose.Schema({
    userId : {type: String},
    listTitel : {type: String},
    listItem : {type: String},
    timeAll : {type: String},
    complete_status : {type: String}
});

const person = mongoose.model("person",personSchema);
const groupOfList = mongoose.model("groupOfList",groupOfListSchema);
const listItem = mongoose.model("listItem",listItemSchema);



const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true}));

app.use(express.static("public"));

function getDateBen()
{
    let toDay= new Date;
    let options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long', 
        day: 'numeric'
    };
    let day = toDay.toLocaleDateString('eng-IN',options);
    return day;
}
function getDate()
{
    let toDay= new Date;
    let options = {
        day: 'numeric'
    };
    let day = toDay.toLocaleDateString('eng-IN',options);
    return day;
}
function getMonth()
{
    let toDay= new Date;
    let options = {
        month: 'long', 
    };
    let day = toDay.toLocaleDateString('eng-IN',options);
    return day;
}

function getTimeandDate()
{
    let current = new Date();
    let cDate = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + current.getDate();
    let cTime = current.getHours() + ":" + current.getMinutes() 
    let dateTime = '  ' + cDate + ' ' + cTime;
    return dateTime;
}



app.get("/", (req,res)=>{
    res.render("login")
});

app.post("/home",function(req,res){  
    
    person.find({userName : req.body.userId}, (err,findPerson)=>{

        if(findPerson.length)
        {
              if(findPerson[0].PassW === req.body.PassW)
              {
                
             let requestedUrl = "/home/" + req.body.userId;
             res.redirect(requestedUrl)

              }
              else
              {
                  res.redirect("/")
              }
        }
        else{

             const myId = new person ({
               userName : req.body.userId,
               PassW : req.body.PassW
            })
            myId.save();
           
            let requestedUrl = "/home/" + "createList/" + req.body.userId;
             res.redirect(requestedUrl)

        }

    })
    
});


app.get("/home/createList/:urlUserId" , (req,res)=>{

    let requestedUserId=req.params.urlUserId;

    res.render("titelSelect",{
        UserName : requestedUserId
    });
})

app.post("/home/getMyList/:urlUser", (req,res)=>{

    let requestedUserId=req.params.urlUser;

    const myList = new  groupOfList ({
        userID : requestedUserId , 
        listTitel : req.body.myListName
     })
     myList.save();

     let requestedUrl = "/home/" + requestedUserId;
     res.redirect(requestedUrl)
        
})


app.get("/home/:urlUser",function(req,res){  
    let requestedUserId=req.params.urlUser;

    let day =getDateBen();
                  
    groupOfList.find({ userID  :requestedUserId}, (err,findList)=>{

       if(findList.length === 0)
       {
        
        let requestedUrltogo = "/home/createList/" + requestedUserId;
        res.redirect(requestedUrltogo)

       }
       else{
        res.render("showLists" ,{
                
                listTitels : findList,
                userIdName : requestedUserId
            }); 
        }


        })
    
});

app.get("/home/delete/:urlUserName/:listTitel/:documentId" , (req,res)=>{
    let requestedUserId=req.params.urlUserName;
    let requestedListTitel=req.params.listTitel;
    let requestedDocumentId=req.params.documentId;

    groupOfList.deleteOne({_id : requestedDocumentId} , (err)=>{
        if(err)
           console.log(err)
        else
           console.log("delete one succesfully  List Titel From List group")
    })
    listItem.deleteMany({ userId : requestedUserId , listTitel : requestedListTitel } , (err)=>{
        if(err)
           console.log(err)
        else
           console.log("delete succesfully all items in List of same Titel From Listitem")
    })

   let requestedUrl = "/home/" + requestedUserId;
   res.redirect(requestedUrl)

})


app.get("/home/:urlId/:urllistTitel" , (req,res)=>{
    let requestedUserId=req.params.urlId;
    let requestedListTitel=req.params.urllistTitel;
  
    let day= getDate()
    let month = getMonth()

    listItem.find({ userId : requestedUserId ,  listTitel : requestedListTitel }, (err,findPerson)=>{
        
        res.render("lists" ,{
            cDay:day,
            cMonth:month,
            listItems:findPerson,
            userIdName : requestedUserId,
            listTitelim : requestedListTitel
        }); 
    })

})

app.post("/add/:urlId/:urlListTitel",function(req,res){
    let requestedUserId=req.params.urlId; 
    let requestedUserTitel=req.params.urllistTitel; 

    let item = req.body.listitem;
    let timeWithDate = getTimeandDate();
            
      const myListGroup = new listItem ({
         userId : requestedUserId ,
         listTitel :req.body.TitelValue,
         listItem : item,
         timeAll : timeWithDate ,
         complete_status : "empty_it"
      })
      myListGroup.save();

    let requestedUrl = "/home/"+requestedUserId  + "/" + req.body.TitelValue;
    res.redirect(requestedUrl);  
});



app.post("/complete/:urlUserId/:urlDataId",function(req,res){

    let requestedUserId = req.params.urlUserId; 
    let requestedDataId = req.params.urlDataId; 
    let titelOfList=req.body.cpltItem;

    listItem.find({ userId : requestedUserId , _id : requestedDataId}, (err,findList)=>{
         if(err)
            console.log(err);
         else 
            {   

                if(findList[0].complete_status == "empty_it")
                {
                    listItem.updateOne({_id : requestedDataId, userId : requestedUserId },
                        {complete_status : "text_dec"},function(err){
                            if(err)
                                console.log(err)
                            else
                                console.log("update succesfully with text_dec")
                        })
                }
                else
                {
                    listItem.updateOne({_id : requestedDataId, userId : requestedUserId },
                        {complete_status : "empty_it" },function(err){
                            if(err)
                                console.log(err)
                            else
                                console.log("update succesfully with empty")
                        })
                }
            }


    })
    let goUrl = "/home/"+requestedUserId + "/" + titelOfList ;
    res.redirect(goUrl); 


});


app.post("/deleteindi/:urllistTitel/:urlDataId",function(req,res){
    let requestedTitel = req.params.urllistTitel; 
    let requestedDataId = req.params.urlDataId; 
    let requestedUserId = req.body.delItem;

    
    listItem.deleteOne({_id : requestedDataId} , (err)=>{
        if(err)
           console.log(err)
        else
           console.log("delete one succesfully")
          
    })
    let goUrl = "/home/"+ requestedUserId + "/" + requestedTitel ;
    res.redirect(goUrl); 
});


app.post("/delete/:urlUserId/:urlTitel",function(req,res){
    let requestedUserId = req.params.urlUserId; 
    let requestedTitel = req.params.urlTitel; 


    listItem.deleteMany ({userId : requestedUserId , listTitel : requestedTitel } , (err)=>{
        if(err)
           console.log(err)
        else
           console.log("delete all succesfully")
          
    })
    let goUrl = "/home/"+requestedUserId ;
    res.redirect(goUrl); 
});

let port = process.env.PORT;
if(port == null || port == ""){
    port = 3500;
}

app.listen(port,function(){
    console.log("your server is running sucessfully");
});