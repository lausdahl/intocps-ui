intocps-ui
---
A new UI for the INTO-CPS application. 


How to build
---
The app is built with [Electron](http://electron.atom.io/) and
[Node.js](https://nodejs.org/). You need npm (comes with Node.js). We use Gulp
to manage tasks. It's easiest to have it installed globally (`npm install -g
gulp`). 

After checking out the repo...

1. To install node dependencies: `npm install`
2. To install other resources: `gulp init`
3. To build the UI: `gulp`
4. To run it: `npm start`


Development
---
For an editor, [Visual Studio Code](https://code.visualstudio.com/) is a good choice. It's
cross-platform and is actually built on top of Electron. That said, you can use
whatever you want.

When developing, `gulp watch` is a useful command. It will automatically detect
when you save a file and run the corresponding build task so you only have to
refresh the app when developing.

If new dependencies have been introduced, you will have to rerun
`npm install` (for changes to `package.json`) or `gulp init` (for changes to
`typings.json` or `bower.json`).

About
---
INTO-CPS is an EU Horizon 2020 research project that is creating an integrated
tool chain for comprehensive Model-Based Design of Cyber-Physical Systems.  For
more, see: http://into-cps.au.dk/

