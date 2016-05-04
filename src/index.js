'use strict';

const Webserver = require('./webserver.js');

const config = require('./config.js');


let server = new Webserver();
server.engine.listen(config.WEBSERVER.PORT, () => {
    console.log(`Webserver started on ${config.WEBSERVER.PORT}`);
});