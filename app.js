var express = require('express')
  ,  app = express()
	, http = require('http').Server(app)
	, path = require('path')
  , fs = require('fs');

var bodyParser = require('body-parser');
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

var w0; var w1; var w2;
var iteration = 0;
var jsonfile = require('jsonfile');
var file = './public/data/line.json';
jsonfile.writeFileSync(file, []);

//-----------------------------------GENERATION POINTS----------------------------//
generatePoints(100);
function generatePoints(numberOfPoints){
  var i = 0;
  var line_x1 = -2;
  var line_y1 = -4;
  var line_x2 = 2;
  var line_y2 = 4;

  var dataPointsJSON = [];

  while(i < numberOfPoints){
    var new_x = getRandomInt(0,200);
    var new_y= getRandomInt(0,200);
    var new_D;

    var d = (new_x - line_x1)*(line_y2-line_y1) - (new_y - line_y1)*(line_x2 - line_x1);
    if(d == 0){

    }else if(d < 0) {
      new_D = -1;
    }else if(d > 0){
      new_D = 1;
    }

    var obj = {
      "X1":new_x,
      "X2":new_y,
      "D":new_D
   }

   dataPointsJSON.push(obj);
   i++;
  }

  var jsonfile = require('jsonfile');
  var file = './public/data/update.json';
  jsonfile.writeFileSync(file, dataPointsJSON);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}
//-----------------------------------END GENERATION POINTS----------------------------//

//All GET methods...........................//
app.get('/', function(req, res){
  w0 = 10;
  w1 = 10;
  w2 = 50;
  var obj = linePointsJSON(w0, w1, w2);
  var jsonfile = require('jsonfile');
  var file = './public/data/oldline.json';
  iteration = 0;
  jsonfile.writeFileSync(file, obj);
  res.render('update', {itr:iteration, w0 : w0, w1:w1, w2:w2});
});


app.get('/update', function(req, res){

      classifyPoints();

  res.render('update', {itr:iteration, w0 : w0, w1:w1, w2:w2});
});

function classifyPoints(){
  var jsonfile = require('jsonfile');
  var file = './public/data/update.json';
  var dataJSON = jsonfile.readFileSync(file);
    for(i = 0;i < dataJSON.length; i++){
      var x1 = dataJSON[i].X1;
      var x2 = dataJSON[i].X2;
      var d = dataJSON[i].D;

      var sign = checkSign(x1, x2);
      if(sign != d){
        //recalculate vector W
        w0 = w0 + (d)*1;
        w1 = w1 + (d)*x1;
        w2 = w2 + (d)*x2;
        var obj = linePointsJSON(w0, w1, w2);
        var jsonfile = require('jsonfile');
        var file = './public/data/line.json';
        jsonfile.writeFileSync(file, obj);
        iteration = iteration + 1;
        break;
      }
    }
}

function checkSign(x1, x2){
    var sign = (w0) + (w1*x1) + (w2*x2);
    return (sign)/(Math.abs(sign));
};


////////////////////-----------LINE RELATED-----------------------///////////////////
function linePointsJSON(w0, w1, w2){

    var y1 = (-1)*(w0/w2);
    var x1 = ((y1*w2) + w0)/((-1)*w1);

    var x2 = (-1)*(w0/w1);
    var y2 = ((-1)/w2)*((x2*w1)+w0);

    var point1 = pointAtX([x1,y1], [x2, y2] , -200);
    var point2 = pointAtX([x1,y1], [x2, y2], 200);

    var obj = [
                {
                  "X1":point1[0],
                  "Y1":point1[1],
                  "X2":point2[0],
                  "Y2":point2[1]
               }
             ];

    return obj;
};

function pointAtX(a, b, x) {
  var slope = (b[1] - a[1]) / (b[0] - a[0])
  var y = a[1] + (x - a[0]) * slope
  return [x, y]
}
/////////////////---------------LINE RELATED END---------------------------/////////



http.listen(app.get('port'), function(){
	console.log('Perceptron Node-Server listening on port ' + app.get('port'));
});
