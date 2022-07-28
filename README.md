eBook Reader
---
### Project Overview
![Overview](ebook-full.gif)

The eBook reader is built on top of Vue2 wit ePub.js engine and backed by Nginx. The core components and their main responsibilities are as follows:

- Shelf Component: Store current reading eBooks. It supports adding, removing, and categorizing books into different groups. Extended features are caching and/or downloading eBooks into local devices and setting the privacy of eBook reading status.
- Home Component: Store and categorize all eBooks. Users can choose an eBook by clicking its cover image, searching the book title, or using the flashcard to randomly pick one.
- eBook Component: Online reader integrated with ePub.js. By unpacking epub files, it can successfully render book content, record current reading progress, and support full-text searching and highlighting. Besides, switching between multiple themes and fonts (including font family and font size) are also implemented for a better user experience.
- Detail Component: List all the details of an eBook, including a brief description and a table of contents.
The backend routes are set up with Node.js and express. Currently, all epub files and images are stored locally and delivered by Nginx server. 

> As this application only focuses on the business logic and functionalities develpoment, the available resources are limited. Most eBooks come with mock content, or even just with the cover pictures.

### How to Start

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

```
nginx -s stop / nginx -s quit => to stop nginx
ps -ef|grep node => check node server status
kill -9 PROCESS_ID
```
