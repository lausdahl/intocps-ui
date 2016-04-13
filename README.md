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
It is also easier to install this globally: `npm install -g typings`

After checking out the repo...

1. To install dependencies: `npm install`
2. To install typescript definitions: `npm install -g typings`
3. To build the UI: `gulp`
4. To run it: `npm start`

About
---
The INTO-CPS is an EU H2020 project that is creating an integrated tool chain
for comprehensive Model-Based Design of Cyber-Physical Systems.  For more, see:
http://into-cps.au.dk/

