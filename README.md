intocps-ui
---
A new UI for the INTO-CPS application. 

How to build
---
The app is built with Electron and Node.js. You need
npm (comes with Node.js). We use Gulp to manage tasks. Its easiest to 
have it installed globally (`npm install -g gulp`). 
Furthermore, you need the node package `typings` to manage typescript definitions.
A typescript definition file offers type information for JavaScript code.
It is also easier to install this globally (`npm install -g typings`).
As the last package manager you need bower to manage front-end packages (`npm install -g bower`).

After checking out the repo...

1. To install dependencies: `npm install`
2. To install gulp: `npm install -g gulp`
3. To install typings: : `npm install -g typings` 
4. To install typescript definitions: `typings install`
5. To install bower: `npm install -g bower`
6. To install bower packages: `bower install`
7. To build the UI: `gulp`
8. To run it: `npm start`

Editor
---
Visual Studio Code works well, it is cross-platform and actually built on top of Electron.

About
---
The INTO-CPS is an EU H2020 project that is creating an integrated tool chain
for comprehensive Model-Based Design of Cyber-Physical Systems.  For more, see:
http://into-cps.au.dk/

