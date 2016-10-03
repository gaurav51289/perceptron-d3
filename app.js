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

var w0 = 10;
var w1 = -1;
var w2 = 2;
var classified = false;
linePointsJSON(w0, w1, w2);



//All GET methods...........................//
app.get('/', function(req, res){
  var w0 = 10;
  var w1 = -1;
  var w2 = 2;
  linePointsJSON(w0, w1, w2);
  res.render('update', {});
});


app.get('/update', function(req, res){

      classifyPoints();


  res.render('update', {});
});

function classifyPoints(){
  var jsonfile = require('jsonfile');
  var file = './public/data/update.json';
  var dataJSON = jsonfile.readFileSync(file);
  var classified = true;
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
        linePointsJSON(w0, w1, w2);
        classified = false;
        break;
      }else{
        console.log("Done"+i);
      }
      console.log(classified);;
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

    var point1 = pointAtX([x1,y1], [x2, y2] , -1000);
    var point2 = pointAtX([x1,y1], [x2, y2], 1000);

    var jsonfile = require('jsonfile');
    var file = './public/data/line.json';
    var obj = [
                {
                  "X1":point1[0],
                  "Y1":point1[1],
                  "X2":point2[0],
                  "Y2":point2[1]
               }
             ];
    jsonfile.writeFileSync(file, obj);


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
