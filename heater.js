var heaterStatus = NaN;

exports.On = function () {
    heaterStatus = "On";
    console.log("Heater On");
}; 
  
exports.Off = function () {
    heaterStatus = "Off";
    console.log("Heater Off");
};

exports.Status = function () {
    // чете крачето от платката отговарящо за нагревателя
    return heaterStatus;
};