var variableObj = {};
var nameOf = (f) => (f).toString().replace(/[ |\(\)=>]/g, ''); // 取变量的名字

// 调用方式：logVariableChange(v, nameOf(() => v), times);
// variableType 取值： Array、Object、String，可以记录变量是特定类型的变化
function logVariableChange(variable, variableName, times, variableType) {
    if (variable != undefined) {
        var isLog = true;
        if (variableType) {
            if (variable['constructor'].toString().indexOf(variableType) == -1) {
                isLog = false;
            }
        }
        if (isLog) {
            if (variable['constructor'] === Array || variable === Object) {
                var json = JSON.stringify(variable);
                if (variableObj[variableName] != json) {
                    variableObj[variableName] = json;
                    console.log(variableName + ':' + variable + ' 数组大小：' + variable.length + ' 循环次数：' + times);
                }
            }
            else {
                if (variableObj[variableName] != variable) {
                    variableObj[variableName] = variable;
                    console.log(variableName + ':' + variable + ' 循环次数：' + times);
                }
            }
        }
    }
}