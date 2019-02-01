var temp    = require('./temp.js');
var program = require('./program.js');
program.getPrograms(); // load all programs

var heater  = require('./heater.js');
heater.Off(); // да изключим за всеки случай :) 

var express = require('express');
var app = express();
let m = NaN; // interval instance

require('events').EventEmitter.defaultMaxListeners = 15;

function intervalFunc() {
    if (!program.processStep(temp.read()) ) {
        heater.Off();
        program.stopLog();
        clearInterval( m );                     //end program 
    }
}

// обработка на командите 
app.get('/c', function(req, res) {   

    var cmd = req.query.cmd;
    var paramCmd = req.query.paramCmd;

    console.log("reciving command: " + cmd);

    if (cmd == "start") {
        res.send("starting program: " + program.getName());
        heater.Off();
        program.startProgram();
        program.startLog();
        m = setInterval(intervalFunc, 2000);

    } else if (cmd == "stop") {
        res.send("stop program: " + program.getName());     
        heater.Off();
        program.stopLog();
        clearInterval( m );                             //end program          
        
    } else if (cmd == "status") {
        res.send(program.getStatus());

    } else if (cmd == "getPrograms") {
        res.send(program.getPrograms());

    } else if (cmd == "setProgram") {
        if (paramCmd != undefined) {
            res.send(program.setProgram(paramCmd));
        }

    }else {
        res.send("unknow command");
        console.log("unknow command");
    }
})


// This responds a GET request 
app.get('/status', function(_req, res) {   
    console.log(program.getName());
    res.send(program.getName());
})

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    
    console.log("Example app listening at http://%s:%s", host, port)
 })