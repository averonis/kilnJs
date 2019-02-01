var tempp    = require('./temp.js');
var heater  = require('./heater.js');
const fs = require('fs');

var prg = [ 
    "name",
    ["0.1", "10", "1"],  // time, target T, wait T? ( 1- wait; 2 don't wait)
    ["0.1", "15", "1"],
    ["0.1", "20", "2"]
];
var currentStep = 1;  // 0 - име, 1 - първа стъпка
let currentTemperature = 0;
var startSegmentTemperature = 0;
let currenTargetTemperature = 0;

let programList = {} ;

var startStepTime = 0;
var startProgramTime = 0;
var endProgramTime = 0;

// логване на процеса
let logFilename = "";
let logInterval = NaN;

function LogIntervalFunc() {
    // write to file
    if (logFilename != "") {
        data = new Date().getTime() + '|' + currentTemperature + "|" + currenTargetTemperature;
        fs.appendFile(logFilename, data+"\n", function(err) {
            if(err) {
                return console.log(err);
            }
        }); 
    } else {
        console.log("Cant write log. Empty log file name.")
    }
}

// управление на програмите
exports.setProgram = function (p) {
    t = 1; 
    for (i in this.programList ) {
        if (p == t) {                   // сетва n-тата програма
            prg = this.programList[i];
        }
        t++;
    }
}; 

exports.get = function () {
    return prg;
}; 

exports.getPrograms = function () {
    var array = fs.readFileSync('./programs.lst').toString().split("\n");
    var currentName = '';
    let programList = {};

    for(i in array) {
        if (array[i].toString().substr(0, 1) == "#")  {
            currentName = array[i].toString().substr(1,  array[i].toString().length);
            programList[currentName] = [];
        } else {
            if (array[i].toString().split("|").length != 3 ) continue;
            programList[currentName].push(array[i].toString().split("|"));
        }
    }
    this.programList = programList;
    return programList;
}; 

exports.getStep = function ( step ) {
    for (let index = 0; index < prg.length; ++index) {
        if ( step == index) {
            return prg[index];
        }
    }
    return false;
}; 

exports.getName = function () {
    if (typeof prg[0] !== 'undefined') {
        return prg[0];
      }
}; 

exports.getCurrentStep = function () {
    return currentStep;
}; 

exports.getCurrentStepData = function () {
    return prg[this.currentStep];
};

exports.getNextStep = function () {
    if (typeof prg[(currentStep + 1)]  !== 'undefined') {
        let ccs = prg[currentStep];
        this.currentStep += 1;
        return ccs;
    }
    return false;
}; 

exports.isCompleate = function () {
    if (typeof prg[currentStep] !== 'undefined') {
        return true;
    }
    return false;
}; 

exports.startProgram = function () {
    ct = new Date().getTime();
    this.startStepTime = this.startProgramTime = ct;
    this.currentStep = 1;
}; 

exports.getStatus = function () {
    return (    "started program: " + this.startProgramTime + 
                " current step: " + this.currentStep + 
                " current temp: " + currentTemperature +
                " target temp: " + currenTargetTemperature +
                " heater: " + heater.Status()
                );

}; 

exports.startLog = function () {
    let dd = new Date();
    logFilename = dd.getFullYear() + '-' + dd.getMonth()+1 + '-' + dd.getDate() + '-' + dd.getHours() + ':' + dd.getMinutes() + ':' + dd.getSeconds() ;
    logInterval = setInterval(LogIntervalFunc, 2000); // период на логване в милисекунди 1000 = 1 секунда
}; 

exports.stopLog = function () {
    clearInterval( logInterval );
}; 

exports.processStep = function (ctmp) {
    let cs = this.getCurrentStepData();
    if (cs === undefined) 
        {
            heater.Off();
            endProgramTime = new Date().getTime();
            return false; // ако няма повече стъпки връща false
        }

    console.log("");
    console.log("currentStep: " + this.currentStep);
    console.log("cs: " + cs);

    let timeToReach = cs[0]*60*60*15; //microtime
    let targetTemp  = cs[1]; 
    let typeWaiting = cs[2];
    let ct = new Date().getTime();
    let delta = ct-this.startStepTime;
    let timePercent = 100*(1-((timeToReach-delta) / timeToReach)); //колко % от времето е изтекло
    if (timePercent > 100) timePercent = 100;
    currenTargetTemperature = startSegmentTemperature + parseInt(((targetTemp-startSegmentTemperature) * timePercent) / 100);  // колко е таргет температурата спрямо процента
    currentTemperature = ctmp;
    console.log("ctmp: " + ctmp);

    if (currenTargetTemperature < currentTemperature) {
        heater.Off();
    } else {
        heater.On();
    }
    
    if (typeWaiting == 1 && timePercent >= 100 && currentTemperature >= targetTemp) {   // тип 1 - времето трябва да изминало
        this.getNextStep();                                                             // и температурата да е достигната
        this.startStepTime = ct;
        startSegmentTemperature = currenTargetTemperature;
    }

    if (typeWaiting == 2 && timePercent >= 100 ) {       // тип 2 - трябва само да е минало времето
        this.getNextStep();
        this.startStepTime = ct;
        startSegmentTemperature = currenTargetTemperature;
    }

    console.log("timeToReach: " + timeToReach);
    console.log("delta: " + delta);
    console.log("timePercent: " + timePercent);
    console.log("currentTemperature: " + currentTemperature);
    console.log("targetTemp: " + targetTemp);
    console.log("currenTargetTemperature: " + currenTargetTemperature);
    return true;
}; 
