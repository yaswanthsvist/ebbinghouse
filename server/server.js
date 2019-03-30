import Express from 'express'
import compression from 'compression'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import fs from 'fs'
import path from 'path'
import ip from 'ip'
import IntlWrapper from '../client/modules/Intl/IntlWrapper'
import ngrok from 'ngrok'
var cp = require('child_process')
var child = cp.fork(__dirname + '/ngrok_fork')

export let ngrokUrl = 'http://' + ip.address() + ':8000'
child.on('message', function(m) {
  // Receive results from child process
  ngrokUrl = m
  console.log('received: ' + m)
})

// Send child process some work
child.send('')
// Initialize the Express App
const app = new Express()

// Set Development modes checks
const isDevMode = process.env.NODE_ENV === 'development' || false
const isProdMode = process.env.NODE_ENV === 'production' || false

// Run Webpack dev server in development mode
if (isDevMode) {
  // Webpack Requirements
  // eslint-disable-next-line global-require
  const webpack = require('webpack')
  // eslint-disable-next-line global-require
  const config = require('../webpack.config.dev')
  // eslint-disable-next-line global-require
  const webpackDevMiddleware = require('webpack-dev-middleware')
  // eslint-disable-next-line global-require
  const webpackHotMiddleware = require('webpack-hot-middleware')
  const compiler = webpack(config)
  app.use(
    webpackDevMiddleware(compiler, {
      noInfo: true,
      publicPath: config.output.publicPath,
      watchOptions: {
        poll: 1000,
      },
    })
  )
  app.use(webpackHotMiddleware(compiler))
}
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

// React And Redux Setup
import { configureStore } from '../client/store'
import { Provider } from 'react-redux'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { match, RouterContext } from 'react-router'
import Helmet from 'react-helmet'

// Import required modules
import routes from '../client/routes'
import { fetchComponentData } from './util/fetchData'
import posts from './routes/post.routes'
import apis from './api/api.routes'
import { eventsData } from './models/events'
import dummyData from './dummyData'
import serverConfig from './config'
import multer from 'multer'

// Set native promises as mongoose promise
mongoose.Promise = global.Promise

// MongoDB Connection
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(serverConfig.mongoURL, error => {
    if (error) {
      console.error('Please make sure Mongodb is installed and running!') // eslint-disable-line no-console
      throw error
    }

    // feed some dummy data in DB.
    dummyData()
  })
}

// Apply body Parser and server public assets and routes
app.use(compression())
app.use(bodyParser.json({ limit: '20mb' }))
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
app.use(Express.static(path.resolve(__dirname, './../public')))
app.use(Express.static(path.resolve(__dirname, './public/images/')))
app.use('/post', posts)
app.use('/api', apis)

// Render Initial HTML
const renderFullPage = (html, initialState) => {
  const head = Helmet.rewind()

  // Import Manifests
  const assetsManifest =
    process.env.webpackAssets && JSON.parse(process.env.webpackAssets)
  const chunkManifest =
    process.env.webpackChunkAssets && JSON.parse(process.env.webpackChunkAssets)

  return `
    <!doctype html>
    <html>
      <head>
        ${head.base.toString()}
        ${head.title.toString()}
        ${head.meta.toString()}
        ${head.link.toString()}
        ${head.script.toString()}

        ${isProdMode
          ? `<link rel='stylesheet' href='${assetsManifest['/app.css']}' />`
          : ''}
        <link href='https://fonts.googleapis.com/css?family=Lato:400,300,700' rel='stylesheet' type='text/css'/>
        <link rel="shortcut icon" href="http://res.cloudinary.com/hashnode/image/upload/v1455629445/static_imgs/mern/mern-favicon-circle-fill.png" type="image/png" />
      </head>
      <body>
        <div id="root">${process.env.NODE_ENV === 'production'
          ? html
          : `<div>${html}</div>`}</div>
        <script>
          window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
          ${isProdMode
            ? `//<![CDATA[
          window.webpackManifest = ${JSON.stringify(chunkManifest)};
          //]]>`
            : ''}
        </script>
        <script src='${isProdMode
          ? assetsManifest['/vendor.js']
          : '/vendor.js'}'></script>
        <script src='${isProdMode
          ? assetsManifest['/app.js']
          : '/app.js'}'></script>
      </body>
    </html>
  `
}

const renderError = err => {
  const softTab = '&#32;&#32;&#32;&#32;'
  const errTrace = isProdMode
    ? `:<br><br><pre style="color:red">${softTab}${err.stack.replace(
        /\n/g,
        `<br>${softTab}`
      )}</pre>`
    : ''
  return renderFullPage(`Server Error${errTrace}`, {})
}

// Server Side Rendering based on routes matched by React-router.
app.use((req, res, next) => {
  match({ routes, location: req.url }, (err, redirectLocation, renderProps) => {
    if (err) {
      return res.status(500).end(renderError(err))
    }

    if (redirectLocation) {
      return res.redirect(
        302,
        redirectLocation.pathname + redirectLocation.search
      )
    }

    if (!renderProps) {
      return next()
    }

    const store = configureStore()

    return fetchComponentData(store, renderProps.components, renderProps.params)
      .then(() => {
        const initialView = renderToString(
          <Provider store={store}>
            <IntlWrapper>
              <RouterContext {...renderProps} />
            </IntlWrapper>
          </Provider>
        )
        const finalState = store.getState()

        res
          .set('Content-Type', 'text/html')
          .status(200)
          .end(renderFullPage(initialView, finalState))
      })
      .catch(error => next(error))
  })
})

const upload = multer({
  dest: './../../public/images/',
  // you might also want to set some limits: https://github.com/expressjs/multer#limits
})

app.post(
  '/upload',
  upload.single('file' /* name attribute of <file> element in your form */),
  (req, res) => {
    const tempPath = req.file.path

    let targetFile = ''
    let targetPath = ''
    let isValidFile = false

    switch (path.extname(req.file.originalname).toLowerCase()) {
      case '.png':
        targetFile = req.file.filename + '.png'
        isValidFile = true
        break
      case '.jpg':
        targetFile = req.file.filename + '.jpg'
        isValidFile = true
        break
      case '.jpeg':
        targetFile = req.file.filename + '.jpeg'
        isValidFile = true
        break
      case '.tif':
        targetFile = req.file.filename + '.tif'
        isValidFile = true
        break
      case '.pdf':
        targetFile = req.file.filename + '.pdf'
        isValidFile = true
        break
      case '.txt':
        targetFile = req.file.filename + '.txt'
        isValidFile = true
        break
    }
    targetPath = path.join(__dirname, '/public/images/' + targetFile)
    if (isValidFile) {
      fs.rename(tempPath, targetPath, err => {
        if (err) return handleError(err, res)
        const { id } = req.body

        eventsData.findOneAndUpdate(
          { _id: id },
          { $push: { uploaded_images: targetFile } },
          { new: true, upsert: true },
          function(err, doc) {
            if (err) {
              res.status(500).send(err)
            }
            res.json({ doc })
          }
        )
      })
    } else {
      fs.unlink(tempPath, err => {
        if (err) return handleError(err, res)

        res
          .status(403)
          .contentType('text/plain')
          .end(
            `${path
              .extname(req.file.originalname)
              .toLowerCase()} extension files are allowed!`
          )
      })
    }
  }
)

// start app
app.listen(serverConfig.port, error => {
  if (!error) {
    console.log(
      `MERN is running on port: ${serverConfig.port}! Build something amazing!`
    ) // eslint-disable-line
  }
})

export default app
