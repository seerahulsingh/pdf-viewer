const fs = require('fs')
const path = require('path')  
const express = require('express')  
const exphbs = require('express-handlebars') 
const PDFImage = require("pdf-image").PDFImage
const PDF = require('pdfinfo')

const app = express()
const port = 3000;

app.engine('.hbs', exphbs({  
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts')
}))

app.set('view engine', '.hbs')  
app.set('views', path.join(__dirname, 'views')) 

app.use("/tmp", express.static(__dirname + '/tmp'))

app.use((request, response, next) => {  
  console.log(request.headers)
  next()
})

app.use((request, response, next) => {  
  request.chance = Math.random()
  next()
})

app.get('/', (request, response) => { 
  const pdf = PDF('tmp/sample.pdf');
  pdf.info(function(err, meta){
    if (err) throw err;
    
    console.log('pdf info', meta)
    
    const pages = meta.pages;
    
    let i = 0;
    
    var theOptions = {};
    theOptions.convertOptions = {};
    theOptions.convertOptions["-quality"] =  100;
    theOptions.convertOptions["-density"] =  150;
    theOptions.outputDirectory = "tmp/output";

    const pdfImage = new PDFImage("tmp/sample.pdf", theOptions)
    
    for(i; i < pages; i++) {
      pdfImage.convertPage(i).then(function (imagePath) {
        console.log(imagePath)
        // 0-th page (first page) of the slide.pdf is available as slide-0.png
        fs.existsSync("tmp/output/" + "sample-" + i + ".png") // => true
      });
    }
  })

  const imagesPath = [];
  for(let i = 0; i < 14; i++) {
    imagesPath.push("/tmp/output/sample-" + i + ".png");
  }

  response.render('home', {
    chance: request.chance,
    images: imagesPath
  })
})

app.listen(port, (err) => {  
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})