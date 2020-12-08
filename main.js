var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var mysql = require('mysql');
var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'class504',
  database : 'opentutorials'
});

db.connect();

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      if(queryData.id === undefined){
        // mysql 대체 이전 코드
        // fs.readdir('./data', function(error, filelist){
        //   var title = 'Welcome';
        //   var description = 'Hello, Node.js';
        //   var list = template.list(filelist);
        //   var html = template.HTML(title, list,
        //     `<h2>${title}</h2>${description}`,
        //     `<a href="/create">create</a>`
        //   );
        //   response.writeHead(200);
        //   response.end(html);
        // });

        // mysql 대체 이후 코드
        db.query(`select * from topic`, function(error, topics){
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = template.list(topics);
          var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      } else {
        // mysql 대체 이전 코드
        // fs.readdir('./data', function(error, filelist){
        //   var filteredId = path.parse(queryData.id).base;
        //   fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
        //     var title = queryData.id;
        //     var sanitizedTitle = sanitizeHtml(title);
        //     var sanitizedDescription = sanitizeHtml(description, {
        //       allowedTags:['h1']
        //     });
        //     var list = template.list(filelist);
        //     var html = template.HTML(sanitizedTitle, list,
        //       `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        //       ` <a href="/create">create</a>
        //         <a href="/update?id=${sanitizedTitle}">update</a>
        //         <form action="delete_process" method="post">
        //           <input type="hidden" name="id" value="${sanitizedTitle}">
        //           <input type="submit" value="delete">
        //         </form>`
        //     );
        //     response.writeHead(200);
        //     response.end(html);
        //   });
        // });

        // mysql 대체 이후 코드
        db.query(`select * from topic`, function(error, topics){
          if(error) {
            throw error;
          }
          db.query(`select * from topic where id=?`, [queryData.id], function(error2, topic){
            if(error2) {
              throw error2;
            }
            var title = topic[0].title;
            var description = topic[0].description;
            var list = template.list(topics);
            var html = template.HTML(title, list,
              `<h2>${title}</h2>${description}`,
              `<a href="/create">create</a>
              <a href="/update?id=${queryData.id}">update</a>
              <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${queryData.id}">
                <input type="submit" value="delete">
              </form>`
              );
              response.writeHead(200);
              response.end(html);
            });
          });
        }
    } else if(pathname === '/create'){
      // mysql 대체 이전 코드
      // fs.readdir('./data', function(error, filelist){
      //   var title = 'WEB - create';
      //   var list = template.list(filelist);
      //   var html = template.HTML(title, list, `
      //     <form action="/create_process" method="post">
      //       <p><input type="text" name="title" placeholder="title"></p>
      //       <p>
      //         <textarea name="description" placeholder="description"></textarea>
      //       </p>
      //       <p>
      //         <input type="submit">
      //       </p>
      //     </form>
      //   `, '');
      //   response.writeHead(200);
      //   response.end(html);
      // });

      // mysql 대체 이후 코드
      db.query(`select * from topic`, function(error, topics){
        var title = 'Create';
        var list = template.list(topics);
        var html = template.HTML(title, list,
          `
          <form action="/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>
          `,
          `<a href="/create">create</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
    } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          db.query(`
          insert into topic (title, description, created, author_id) 
           values(?, ?, now(), ?)`,
           [post.title, post.description, 1],
           function(error, result){
             if(error){
               throw error;
             }
             response.writeHead(302, {Location: `/?id=${result.insertId}`});
             response.end();
           }
          )
      });
    } else if(pathname === '/update'){
      db.query(`select * from topic`, function(error, topics){
          if(error) {
            throw error;
          }
        db.query(`select * from topic where id=?`, [queryData.id], function(error2, topic){
          if(error2) {
            throw error;
          }
          var list = template.list(topics);
          var html = template.HTML(topic[0].title, list,
            `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${topic[0].id}">
              <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
              <p>
                <textarea name="description" placeholder="description">${topic[0].description}</textarea>
              </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
      });
    } else if(pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);

          // mysql 대체 이전 코드
          // var id = post.id;
          // var title = post.title;
          // var description = post.description;
          // fs.rename(`data/${id}`, `data/${title}`, function(error){
          //   fs.writeFile(`data/${title}`, description, 'utf8', function(err){
          //     response.writeHead(302, {Location: `/?id=${title}`});
          //     response.end();
          //   })
          // });

          // mysql 대체 이후 코드
          db.query(`update topic set title=?, description=?, author_id=1 where id=?`, [post.title, post.description, post.id], function(error, result){
            response.writeHead(302, {Location: `/?id=${post.id}`});
            response.end();
          })
      });
    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var filteredId = path.parse(id).base;

          // mysql 대체 이전 코드
          // fs.unlink(`data/${filteredId}`, function(error){
          //   response.writeHead(302, {Location: `/`});
          //   response.end();
          // })

          //// mysql 대체 이후 코드
          db.query(`delete from topic where id=?`, [post.id], function(error, result){
            if(error) {
              throw error;
            }
            response.writeHead(302, {Location: `/`});
            response.end();
          })
      });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(4000);
