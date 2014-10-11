/**
 * Created by Gigi on 10.10.2014.
 */

function encodeChar(num){
    if(num < (1 << 7)){
        return "%" + num.toString(16);
    }
    else if(num < (1 << 11)){
        return "%" + ((num >> 6) | (6 << 5)).toString(16) +
            "%" + ((2 << 6) | (num & ((1 << 6) - 1))).toString(16);
    }
    else if(num < (1 << 16)){
        return "%" + ((num >> 12) | (14 << 4)).toString(16) +
            "%" + ((2 << 6) | ((num >> 6)  & ((1 << 6) - 1))).toString(16) +
            "%" + ((2 << 6) | (num & ((1 << 6) - 1))).toString(16);
    }
    else{
        return "%" + ((num >> 17) | (30 << 4)).toString(16) +
            "%" + ((2 << 6) | ((num >> 12)  & ((1 << 6) - 1))).toString(16) +
            "%" + ((2 << 6) | ((num >> 6) & ((1 << 6) - 1))).toString(16) +
            "%" + ((2 << 6) | (num & ((1 << 6) - 1))).toString(16);
    }
}

function isGood(c){
    return ((c <= 'z' && c >= 'a') || (c >= 'A' && c <= 'Z') ||(c >= '0' && c <= '9'));
}

function encodeString(single){
    var result = "";
    for(var i = 0; i < single.length; i++){
        var current;
        if(isGood(single.charAt(i)))
            current = single.charAt(i);
        else
            current = encodeChar(single.charCodeAt(i));

        if(current.length == 2){
            result += "%0" + current.substr(2);
        }
        else{
            result += current;
        }
    }
    return result;
}

exports.encode = function (data){
    if(typeof data === "string"){
        return encodeString(data);
    }
    if(Array.isArray(data)){
        var result = [];
        for(var i = 0; i < data.lengt; i++){
            result.push(encodeString(data[i]));
            return result;
        }
    }
    if(typeof data === 'object'){
        console.log(data);
        var result = "";
        for(var key in data){
            if(!data.hasOwnProperty(key))
                continue;
            if(result.length > 0)
                result += "&";
            result += key + "=" + encodeString("" + data[key]);
        }
        return result;
    }
    else{
        return encodeString("" + data);
    }
}
function countStartingOnes(data){
    for(var i = 7; i >= 0; i--){
        if(((1 << i) & data) == 0)
            return 7 - i;
    }
    return -1;
}

function decodeString(data){
    if(data.length < 2)
        return data;
    var result = "";
    if(data.charAt(0) == '%'){
        var first = parseInt(data.substr(1, 2), 16);
        if(countStartingOnes(first) == 0){
            return result + String.fromCharCode(first) + decode(data.substr(4));
        }
        else if(countStartingOnes(first) == 2){
            return String.fromCharCode(((((1 << 5) - 1) & first) << 6) |
                (parseInt(data.substr(4, 2), 16) & ((1 << 6) - 1))) + decode(data.substr(6));
        }
        else if(countStartingOnes(first) == 3){
            return String.fromCharCode(((((1 << 4) - 1) & first) << 12) |
                ((parseInt(data.substr(4, 2), 16) & ((1 << 6) - 1)) << 6) |
                (parseInt(data.substr(7, 2), 16) & ((1 << 6) - 1))) + decode(data.substr(9));
        }
        else{
            return String.fromCharCode(((((1 << 3) - 1) & first) << 18) |
                ((parseInt(data.substr(4, 2), 16) & ((1 << 6) - 1)) << 12) |
                ((parseInt(data.substr(7, 2), 16) & ((1 << 6) - 1)) << 6) |
                (parseInt(data.substr(10, 2), 16) & ((1 << 6) - 1))) + decode(data.substr(9));
        }
    }
    else{
        return data.charAt(0) + decode(data.substr(1));
    }
}
exports.decode = function(data){
    if(typeof data === "string"){
        if(data.indexOf("=") != -1) {
            var col = data.split("&");
            var o = {};
            for(var i = 0; i < col.length; i++){
                o[col[i].substr(0, col[i].indexOf("="))] = decodeString(col[i].substr(col[i].indexOf("=") + 1));
            }
            return o;
        }
        else
            return decodeString(data);
    }
    if(Array.isArray(data)){
        var result = [];
        for(var i = 0; i < data.lengt; i++){
            result.push(decodeString(data[i]));
            return result;
        }
    }
}

//console.log(encode("სალომე"));
//console.log(decode("key=%e1%83%a1%e1%83%90%e1%83%9a%e1%83%9d%e1%83%9b%e1%83%94"));