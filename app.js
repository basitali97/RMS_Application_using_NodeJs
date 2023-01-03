const express = require('express');
const app = express();
const router = express.Router();
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const encoder = bodyParser.urlencoded({extended : true});
const session = require('express-session');
const localStorage = require("localStorage");
app.set('views', __dirname + '/view');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

const connection = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : 'root',
  database : 'noderesult'
});


connection.connect(function(error){
  if(error) throw error;
  else console.log("Connection Successful");
})

var login = 0;
app.use('/public',express.static('public', {root : __dirname}))

app.set('trust proxy', 1)
app.use(session({
  secret: 'result data',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true },
  loggedIn : false
}))

app.get('/',function(req,res) {
    res.sendFile('/view/index.html', {root : __dirname});
});


app.post("/", encoder,function(req, res) {
  if(req.session.loggedIn){
    next();
  }
  else{
    var email = req.body.userEmail;
    var pass = req.body.pass;
    connection.query("select * from loginusers where email = ? and pass = ?", [email, pass],function(error, result, field) {
      if(result.length > 0){
        localStorage.setItem('userId' , result[0].userId);
        localStorage.setItem('username' , result[0].username); 
        login = 1;
        res.redirect('/editStudent');
      }
      else{
        res.status(400).send('Entered email or password does not match with database');
      }
      res.end();
    })
  }
});

app.post("/studentRecord", encoder,function(req, res) {
  if(req.session.loggedIn){
    next();
  }
  else{
    var rollNo = req.body.rollNo;
    var studentName = req.body.studentName;
    var dob = req.body.dob;
    var score = req.body.score;
    var userId = localStorage.getItem('userId');

    var dobYear = new Date(dob).getFullYear();
    //console.log(rollNo, studentName, dob, score, userId, dobYear);
    if(rollNo && studentName && dob && score && userId){
      if(dobYear >= 1990 && dobYear <= 2017){
        if(score >= 0 && score <= 1000){
          connection.query("insert into studentdata (userId, rollNo, studentName, dob, score) values (?, ?, ?, ?, ?)", [userId,rollNo, studentName,dob, score],function(error, result, field) {
            if(!error){
              res.redirect('/editstudent');
            }
            else{
              res.status(400).send('Enter some unique roll number');
            }
            res.end();
          })
        }
        else{
          res.status(400).send('Please enter valid score between 0 to 1000');
        }
      }
      else{
        res.status(400).send('Please select a valid date of birth between the year 1990 to 2017');
      }
    }
    else{
      res.status(400).send('Please enter all field correctly ');
    }
  }
});

app.post("/studentRecordUpdate", encoder,function(req, res) {
  var rollNo = req.body.rollNo;
  var studentName = req.body.studentName;
  var dob = req.body.dob;
  var score = req.body.score;
  var studentId = req.body.updateBtn;
  var userId = localStorage.getItem('userId');
  if(rollNo && studentId && studentName && dob && score && userId){
    var dt = new Date(dob).getFullYear();
    if(dt >= 1990 && dt <= 2017){
      if(score >= 0 && score <= 1000){
        connection.query("update studentdata set userId = ?, rollNo = ?, studentName = ?, dob = ?, score = ? where studentId = ?",[userId,rollNo,studentName,dob,score,studentId], function(error,result,field){
          if(!error){
            res.redirect("/editStudent")
          }
          else{
            res.status(404).send("Not Found");
          }
        })
      }
      else{
        res.status(400).send("Enter score between 0 to 1000");
      }
    }
    else{
      res.status(400).send("Enter date of birth between 1990 to 2017");
    }
  }
  else{
    res.status(400).send("Please enter all the fields");
  }
});

app.post("/register", encoder,function(req, res) {
  if(req.session.loggedIn){
    next();
  }
  else{
    var username = req.body.userName;
    var email = req.body.userEmail;
    var pass = req.body.pass;
    if(username && email && pass){
      connection.query("insert into loginusers (username, email, pass) values (?, ?, ?)", [username,email, pass],function(error, result, field) {
        if(!error){
          res.redirect('/teacher');
        }
        else{
          res.status(400).send('Try some unique email');
        }
        res.end();
      })
    }
    else{
      res.status(400).send('Please enter all field correctly ');
    }
  }
});

app.get('/teacher', function(req, res){
  login = 0;
  res.sendFile('/view/teacher.html', {
    root : __dirname,
    title: 'Teacher'
  });
});

app.get('/student', function(req, res){
  res.sendFile('/view/student.html', {
    root : __dirname,
    title: 'Student'
  });
});

app.post('/result',encoder, function(req, res){
  var rollNo = req.body.rollNo;
  var dob = req.body.dob;
  //console.log(rollNo, dob);
  if(rollNo && dob){
    connection.query("select * from studentdata where rollNo = ? and dob = ?", [rollNo, dob], function(error,result,field){
      if(result.length > 0){
        res.render('result', {
          root : __dirname,
          title: 'result',
          data : result[0],
          dob : dob
        });
      }
      else{
        res.status(404).send("Student data not found");
      }
    });
  }
  else{
    res.status(400).send("Enter Roll number and date of birth");
  }
});

app.get('/editStudent', function(req, res){
  if(login){
    var userId = localStorage.getItem('userId');
    connection.query("select * from studentdata where userId = ?",[userId], function(error, result1, field){
      if(result1.length >= 0){
        login = 1;
        res.render('editStudent',{
          data : result1,
          title : 'Teacher Dashboard',
          username : localStorage.getItem('username')
        });
      }
      else{
        res.status(404).send('Not found');
      }
    }) 
  }
  else{
    res.status(400).send('Login first!!');
  }
});

app.get('/studentData/:id', function(req, res){
  if(login){
    var studentId = req.params.id;
    connection.query("delete from studentdata where studentId = ?",[studentId], function(error, result1, field){
      //console.log(result1);
      if(!error){
        login = 1;
        res.redirect('/editStudent');
      }
      else{
        res.status(404).send('Not found');
      }
    }) 
  }
  else{
    res.status(400).send('Login first!!');
  }
});

app.get('/signup',function(req,res){
  res.sendFile('/view/signup.html',{
    root : __dirname,
    title : 'SignUp'
  });
});

app.get('/addStudent',function(req,res){
  if(login){
    res.render('addStudent',{
      root : __dirname,
      title : 'Add Student'
    });
  }
  else{
    res.status(400).send('Login first!!');
  }
});

app.get('/updateStudent/:id',function(req,res){
  if(login){
    var studentId = req.params.id;
    connection.query('select * from studentdata where studentId = ?', [studentId], function(error, result, field){
      if(!error){
        var dob = new Date(result[0].dob).getFullYear()+'-'+("0"+(new Date(result[0].dob).getMonth()+1)).slice(-2)+'-'+("0"+new Date(result[0].dob).getDate()).slice(-2)
        res.render('updateStudent',{
          root : __dirname,
          title : 'updateStudent',
          data : result,
          dob : dob
        });
      }
      else{
        res.status(404).send('Not found');
      }
    })
  }
  else{
    res.status(400).send('Login first!!');
  }
});

app.get('/logout',function(req,res,next){
  localStorage.clear();
  login = 0;
  res.redirect('/');
});

app.use('/', router);
app.listen(process.env.port || 3000);