var ThumbnailerWeb = require('node-thumbnailer-web')
var fs = require('fs')
var http = require('http')

var tmpDir = __dirname + '/tmp'
fs.exists(tmpDir,function(exists){
  if(!exists){
    fs.mkdir(tmpDir,function(){
      runExample()
    })
  }
  else{
    runExample()
  }
})

var doneCount = 0;

function runExample(){
  var thumbnailerWeb = ThumbnailerWeb.create({
    tmpDir : tmpDir
  })

  var monkeyUrl = 'http://upload.wikimedia.org/wikipedia/commons/4/4e/Macaca_nigra_self-portrait_large.jpg'

  thumbnailerWeb.resize(monkeyUrl,320,320,'http://localhost:11001/resized.jpg',function(err){
  })

  thumbnailerWeb.crop(monkeyUrl,2000,2000,800,680,'http://localhost:11001/cropped.jpg',function(err){
  })

  thumbnailerWeb.cropMiddleSquare(monkeyUrl,'http://localhost:11001/square.jpg',function(err){
    if(!err){
      thumbnailerWeb.resize('http://localhost:11001/square.jpg',320,320,'http://localhost:11001/square_small.jpg',function(err){
      })
    }
  })
}

var server = http.createServer(function(req,res){
  var filename = req.url.split('/')[1]
  var outPath = [tmpDir,filename].join('/')
  if(req.method == 'PUT'){
    console.log('Receiving thumbnail...')
    console.log('Saving as '+outPath)
    var outStream = fs.createWriteStream(outPath)
    req.pipe(outStream)
    req.on('end',function(){
      res.writeHead(200)
      res.write('')
      res.end()
      doneCount++
      if(doneCount == 4){
        server.close()
      }
    })
  }
  else if(req.method == 'GET'){
    res.writeHead(200)
    fs.createReadStream(outPath).pipe(res)
  }
})
server.listen(11001)