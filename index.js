var express = require('express')
var nunjucks = require('nunjucks');
var feed = require('feed-read')
var session = require('express-session')
var bodyParser = require('body-parser')
var debug = require('debug')('gghelpdesk')
var moment = require('moment')

var ggRssUrl = "http://community.giffgaff.com/napa/rss/board?board.id=QA1"

var app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
   secret: "nslijbagliubhaguliadfgliuduilb",
   resave: false,
   saveUninialized: true
}))

nunjucks.configure('views', {
	autoescape: true,
	express : app
});

app.use('/static', express.static(__dirname + '/static'));
app.use('/', express.static(__dirname + '/wwwroot'));
app.get('/session', function (req, res) {
   var lastTouched = req.session.lastTouched;
   req.session.lastTouched = new Date();
   res.render('session.html', {
	session: req.session
   })
})

app.get('/logout', function (req, res) {
	res.session = null
	res.end("Logged out!")
})
var articlesCache = [];
var articlesLastGot = moment().subtract(30, 'seconds')

function getFeed(url, cb)
{
 if (Math.abs(moment().diff(articlesLastGot)) < 10000) // cache for 10 seconds
 {
   debug("Serving cache")
   cb(null, articlesCache)
   return
 }
 debug("Doing RSS feed get")
 feed(url, function (err, articles) {
    articlesLastGot = moment()
    articlesCache = articles
    cb(err, articles)
 })
 return
}

app.get('/newitems', function (req, res) {
 getFeed(ggRssUrl, function(err, articles) {
   if (err) throw err;
   articles.sort(function (a,b) {
	if (a.published > b.published)
		return -1;
	if (a.published < b.published)
		return 1;
	return 0
   })
   // Each article has the following properties:
   // 
   //   * "title"     - The article title (String).
   //   * "author"    - The author's name (String).
   //   * "link"      - The original article link (String).
   //   * "content"   - The HTML content of the article (String). 
   //   * "published" - The date that the article was published (Date).
   //   * "feed"      - {name, source, link}
   // 
   //debug("req.session.seenItems" , req.session.seenItems)
   var unseenArticles = []
   var seenItems = {}
   if (typeof req.session.seenItems === 'undefined')
   {
   } else {
      seenItems = JSON.parse(req.session.seenItems)
   }
   //debug("seenItems", seenItems)
   // expire any that are like super old ?

   for (articleNum in articles)
   {
      var article = articles[articleNum]
      var articleString = article.link + article.published
      if ( Object.keys(seenItems).indexOf(articleString) == -1 )
      {
          //debug("NOT seen " + articleString + " before")
          article.ago = moment(article.published).fromNow()
          unseenArticles.push(article)
          seenItems[articleString] = { link: article.link, published: article.published}
	  //debug(seenItems[articleString])
      } else {
         //debug("Seen " + articleString + " before")
      }
   }
   //debug("logging to session", JSON.stringify(seenItems))
   req.session.seenItems = JSON.stringify(seenItems)
   //debug("req.session.seenItems" , req.session.seenItems)
   res.render('newitems.json', {'articles': unseenArticles})
 });
});

var urlencodedParser = bodyParser.urlencoded({ extended: true})

app.get('/reset', function (req, res) {
	req.session.seenItems = "{}"
	res.end("Done")
})

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('gghelpdesk listening at http://%s:%s', host, port)

})
