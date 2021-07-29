const express = require('express')
const mysql = require('mysql')
const constant = require('./const')
const cors = require('cors')

const app = express()
app.use(cors())

function connect() {
  return mysql.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPwd,
    database: 'book',
  })
}

/* Home Page */
function randomBooks(num, total) {
  let rand = []
  for (let i = 0; i < num; i++) {
    rand.push(Math.floor(Math.random() * total))
  }
  return rand
}

function createData(results, key) {
  return handleData(results[key])
}

function handleData(data) {
  if (!data.cover.startsWith('http://')) {
    data['cover'] = `${constant.resUrl}/img${data.cover}`
  }
  data['selected'] = false
  data['private'] = false
  data['cache'] = false
  data['haveRead'] = 0
  return data
}

function createGuessLikes(data) {
  const n = parseInt(randomBooks(1, 3)) + 1
  data['type'] = n
  switch (n) {
    case 1:
      data['result'] =
        data.id % 2 === 0
          ? '《Wuthering Heights》'
          : '《When Breath Becomes Air》'
      break
    case 2:
      data['result'] =
        data.id % 2 === 0 ? '《A Tale of Two Cities》' : '《Atomic Habits》'
      break
    case 3:
      data['result'] = '《The Lord of the Rings》'
      data['percent'] = data.id % 2 === 0 ? '10%' : '71%'
      break
  }
  return data
}

function createRecommend(data) {
  data['readers'] = Math.floor((data.id / 2) * randomBooks(1, 100))
  return data
}

function createCategoryIds(num) {
  const arr = []
  constant.category.forEach((item, index) => {
    arr.push(index + 1)
  })
  const results = []
  for (let i = 0; i < num; i++) {
    // Algorithm: making sure not generate duplicate category ids
    const rand = Math.floor(Math.random() * (arr.length - i))
    results.push(arr[rand])
    arr[rand] = arr[arr.length - i - 1]
  }
  return results
}

function createCategory(list) {
  const categoryIds = createCategoryIds(6)
  const results = []
  categoryIds.forEach((id) => {
    const subList = list.filter((item) => item.category === id).slice(0, 4)
    subList.map((item) => {
      return handleData(item)
    })
    results.push({
      category: id,
      list: subList,
    })
  })

  return results.filter((item) => item.list.length === 4)
}

app.get('/book/home', (req, res) => {
  const bind = connect()
  bind.query("select * from book where cover != ''", (err, results) => {
    const length = results.length
    const guessLikes = []
    const recommend = []
    const featured = []
    const random = []
    const categoryList = createCategory(results)
    const categories = [
      {
        category: 1,
        num: 56,
        img1: constant.resUrl + '/cover/cs/A978-3-319-62533-1_CoverFigure.jpg',
        img2: constant.resUrl + '/cover/cs/A978-3-319-89366-2_CoverFigure.jpg',
      },
      {
        category: 2,
        num: 51,
        img1: constant.resUrl + '/cover/ss/A978-3-319-61291-1_CoverFigure.jpg',
        img2: constant.resUrl + '/cover/ss/A978-3-319-69299-9_CoverFigure.jpg',
      },
      {
        category: 3,
        num: 32,
        img1: constant.resUrl + '/cover/eco/A978-3-319-69772-7_CoverFigure.jpg',
        img2: constant.resUrl + '/cover/eco/A978-3-319-76222-7_CoverFigure.jpg',
      },
      {
        category: 4,
        num: 60,
        img1: constant.resUrl + '/cover/edu/A978-981-13-0194-0_CoverFigure.jpg',
        img2: constant.resUrl + '/cover/edu/978-3-319-72170-5_CoverFigure.jpg',
      },
      {
        category: 5,
        num: 23,
        img1: constant.resUrl + '/cover/eng/A978-3-319-39889-1_CoverFigure.jpg',
        img2: constant.resUrl + '/cover/eng/A978-3-319-00026-8_CoverFigure.jpg',
      },
      {
        category: 6,
        num: 42,
        img1: constant.resUrl + '/cover/env/A978-3-319-12039-3_CoverFigure.jpg',
        img2: constant.resUrl + '/cover/env/A978-4-431-54340-4_CoverFigure.jpg',
      },
      {
        category: 7,
        num: 7,
        img1: constant.resUrl + '/cover/geo/A978-3-319-56091-5_CoverFigure.jpg',
        img2: constant.resUrl + '/cover/geo/978-3-319-75593-9_CoverFigure.jpg',
      },
      {
        category: 8,
        num: 18,
        img1: constant.resUrl + '/cover/his/978-3-319-65244-3_CoverFigure.jpg',
        img2: constant.resUrl + '/cover/his/978-3-319-92964-4_CoverFigure.jpg',
      },
      {
        category: 9,
        num: 13,
        img1:
          constant.resUrl +
          '/cover/law/2015_Book_ProtectingTheRightsOfPeopleWit.jpeg',
        img2:
          constant.resUrl +
          '/cover/law/2016_Book_ReconsideringConstitutionalFor.jpeg',
      },
      {
        category: 10,
        num: 24,
        img1: constant.resUrl + '/cover/ls/A978-3-319-27288-7_CoverFigure.jpg',
        img2: constant.resUrl + '/cover/ls/A978-1-4939-3743-1_CoverFigure.jpg',
      },
      {
        category: 11,
        num: 6,
        img1: constant.resUrl + '/cover/lit/2015_humanities.jpg',
        img2:
          constant.resUrl +
          '/cover/lit/A978-3-319-44388-1_CoverFigure_HTML.jpg',
      },
      {
        category: 12,
        num: 14,
        img1:
          constant.resUrl +
          '/cover/bio/2016_Book_ATimeForMetabolismAndHormones.jpeg',
        img2:
          constant.resUrl +
          '/cover/bio/2017_Book_SnowSportsTraumaAndSafety.jpeg',
      },
      {
        category: 13,
        num: 16,
        img1: constant.resUrl + '/cover/bm/2017_Book_FashionFigures.jpeg',
        img2:
          constant.resUrl +
          '/cover/bm/2018_Book_HeterogeneityHighPerformanceCo.jpeg',
      },
      {
        category: 14,
        num: 16,
        img1:
          constant.resUrl +
          '/cover/es/2017_Book_AdvancingCultureOfLivingWithLa.jpeg',
        img2:
          constant.resUrl +
          '/cover/es/2017_Book_ChinaSGasDevelopmentStrategies.jpeg',
      },
      {
        category: 15,
        num: 2,
        img1:
          constant.resUrl +
          '/cover/ms/2018_Book_ProceedingsOfTheScientific-Pra.jpeg',
        img2:
          constant.resUrl +
          '/cover/ms/2018_Book_ProceedingsOfTheScientific-Pra.jpeg',
      },
      {
        category: 16,
        num: 9,
        img1:
          constant.resUrl +
          '/cover/mat/2016_Book_AdvancesInDiscreteDifferential.jpeg',
        img2:
          constant.resUrl +
          '/cover/mat/2016_Book_ComputingCharacterizationsOfDr.jpeg',
      },
      {
        category: 17,
        num: 20,
        img1:
          constant.resUrl +
          '/cover/map/2013_Book_TheSouthTexasHealthStatusRevie.jpeg',
        img2:
          constant.resUrl +
          '/cover/map/2016_Book_SecondaryAnalysisOfElectronicH.jpeg',
      },
      {
        category: 18,
        num: 16,
        img1: constant.resUrl + '/cover/phi/2015_Book_TheOnlifeManifesto.jpeg',
        img2:
          constant.resUrl +
          '/cover/phi/2017_Book_Anti-VivisectionAndTheProfessi.jpeg',
      },
      {
        category: 19,
        num: 10,
        img1: constant.resUrl + '/cover/phy/2016_Book_OpticsInOurTime.jpeg',
        img2:
          constant.resUrl +
          '/cover/phy/2017_Book_InterferometryAndSynthesisInRa.jpeg',
      },
      {
        category: 20,
        num: 26,
        img1:
          constant.resUrl +
          '/cover/psa/2016_Book_EnvironmentalGovernanceInLatin.jpeg',
        img2:
          constant.resUrl +
          '/cover/psa/2017_Book_RisingPowersAndPeacebuilding.jpeg',
      },
      {
        category: 21,
        num: 3,
        img1:
          constant.resUrl +
          '/cover/psy/2015_Book_PromotingSocialDialogueInEurop.jpeg',
        img2:
          constant.resUrl +
          '/cover/psy/2015_Book_RethinkingInterdisciplinarityA.jpeg',
      },
      {
        category: 22,
        num: 1,
        img1:
          constant.resUrl +
          '/cover/sta/2013_Book_ShipAndOffshoreStructureDesign.jpeg',
        img2:
          constant.resUrl +
          '/cover/sta/2013_Book_ShipAndOffshoreStructureDesign.jpeg',
      },
    ]
    const banner = [
      constant.resUrl + '/home_banner.jpg',
      constant.resUrl + '/home_banner2.jpg',
      constant.resUrl + '/home_banner3.jpg',
      constant.resUrl + '/home_banner4.jpg',
      constant.resUrl + '/home_banner5.jpg',
    ]
    randomBooks(9, length).forEach((index) => {
      const rawData = createData(results, index)
      guessLikes.push(createGuessLikes(rawData))
    })
    randomBooks(3, length).forEach((index) => {
      const rawData = createData(results, index)
      recommend.push(createRecommend(rawData))
    })
    randomBooks(6, length).forEach((index) => {
      featured.push(createData(results, index))
    })
    randomBooks(1, length).forEach((index) => {
      random.push(createData(results, index))
    })
    res.json({
      guessLikes,
      banner,
      recommend,
      featured,
      random,
      categories,
      categoryList,
    })
    bind.end()
  })
})

/* Detail Page*/
app.get('/book/detail', (req, res) => {
  const bind = connect()
  const fileName = req.query.fileName
  const sql = `select * from book where fileName='${fileName}'`
  bind.query(sql, (err, results) => {
    if (err) {
      res.json({
        error_code: 1,
        msg: 'Fetching book detail failed.',
      })
    } else {
      if (results && results.length === 0) {
        res.json({
          error_code: 1,
          msg: 'Fetching book detail failed.',
        })
      } else {
        const book = handleData(results[0])
        res.json({
          error_code: 0,
          msg: 'Feching detail success.',
          data: book,
        })
      }
    }
    bind.end()
  })
})

/* List Page*/
app.get('/book/list', (req, res) => {
  const bind = connect()
  bind.query("select * from book where cover != ''", (err, results) => {
    if (err) {
      res.json({
        error_code: 1,
        msg: 'Fetching list failed.',
      })
    } else {
      results.map((item) => handleData(item))
      const data = {}
      constant.category.forEach((text) => {
        data[text] = results.filter((book) => book.categoryText === text)
      })
      res.json({
        error_code: 0,
        msg: 'Fetching list success.',
        data: data,
        total: results.length,
      })
    }
    bind.end()
  })
})
app.get('/book/flat-list', (req, res) => {
  const conn = connect()
  conn.query("select * from book where cover!=''", (err, results) => {
    if (err) {
      res.json({
        error_code: 1,
        msg: '获取失败',
      })
    } else {
      results.map((item) => handleData(item))
      res.json({
        error_code: 0,
        msg: '获取成功',
        data: results,
        total: results.length,
      })
    }
    conn.end()
  })
})
/* Book Shelf*/
app.get('/book/shelf', (req, res) => {
  res.json({
    // This comes from mixin.js, line 196
    bookList: [],
  })
})

/* Voice : This part is implemented in the front-end StoreSpeaking.vue part. */
// app.get('/voice', (req, res) => {
//     voice(req, res)
// })

const server = app.listen(3000, () => {
  const host = server.address().address
  const port = server.address().port
  console.log('Server successfully connects to port 3000.')
})
