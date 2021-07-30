#### Shell Script

- ```shell
   echo "start updating frontend..."
   cd ~/imooc-ebook/vue-immoc-ebook
   echo "updating source..."
   git pull
   echo "frontend building..."
   npm run build
   echo "frontend publish..."
   rm -rf ~/nginx-1.5.4/upload/book
   mv dist ~/nginx-1.5.4/upload/book
   echo "finish updating frontend..."

   echo "start updating backend..."
   cd ~/imooc-ebook/node-immoc-ebook
   echo "updating source..."
   git pull
   echo "stoping node server..."
   kill -9 `ps -ef|grep node|grep app.js|awk '{print $2}'`
   echo "restarting service..."
   node app.js &
   echo "finish updating backend..."
  ```

  - using `./` to execute .sh file

## Two Ways of Start Program

- **Run on `frontend` -- `Online Server`**
  - Make changes to the following files
    - `.env.development`
      ```
      VUE_APP_EPUB_URL=http://47.99.166.157/epub
      VUE_APP_EPUB_OPF_URL=http://47.99.166.157/epub2
      VUE_APP_RES_URL=http://47.99.166.157/book/res
      VUE_APP_BASE_URL=http://47.99.166.157:3000
      VUE_APP_VOICE_URL=http://47.99.166.157:3000
      VUE_APP_BOOK_URL=http://47.99.166.157:3000
      ```
    - `/views/store/StoreHome.vue`
      - `data.guessLikes = data.guessYouLike`
      - comment out `<carousel> & children <Slide>` elements
      - restore `<div class="banner-wrapper">` element (mock)
    - `vue.config.js`
      - comment out `function mock(){}` & `before(app){...}`
        <br>
- **Run on `Local Server`-- `Nginx`**

  1.  Run `npm run dev` in `/frontend`, check the IP address
  2.  Nginx, MySQL server
      - `cd C:\nginx-1.5.4` then `start nginx`, check `localhost:8010` has book resources
      - open `MySQL Notifier` to open connection
        > nginx fetch data from MySQL
  3.  `.env.development` and `const.js (in /backend)` files IP address changing
  4.  `npm run dev (/frontend)` & `node app.js (/backend)`
  5.  IP fixed, then (`.env.production`) & `npm run build`
      - change to online IP address, do the fix above;
      - otherwise, make it to local IP address, fetch from local nginx

  <br>

- `nginx -s stop` / `nginx -s quit` to stop nginx
- `ps -ef|grep node` check node server status
- `kill -9 PROCESS_ID`
  <br>

---

fake PayPal account in this app:
user: sb-p60m476944604@business.example.com
pw: Ldf6PV=q
