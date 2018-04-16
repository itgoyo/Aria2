# BaiduExporter Contributing Guide

Before contributing to BaiduExporter, please make sure to take a moment and read through the following guidelines.

- [JavaScript Standard Style](https://standardjs.com/)
- [Sass Guidelines](https://sass-guidelin.es/)


## Development Setup

Please make sure your [Node.js](http://nodejs.org) **version 6+**.

After cloning the repo, run:

``` bash
$ cd chrome
$ npm install
$ npm run dev
```

Now, you can load extension from `dist` fold. Gulp will watch and re-build the project.

If you want to package the extension. run:

``` bash
$ npm run build
```

Gulp will generate compressed file in `dist` fold.
