var hook = {
    nativePropertyList: {}, // 原始属性
    nativeFuncList: { 'prototype': {} }, // 原始方法
    pre: ' Hook Pre',
    post: 'Hook Post',

    preHookCallback: function (objName, funcName, args, context) { },

    postHookCallback: function (objName, funcName, args, context, ret) { },

    hookAnyProperty: function (obj, propertyName, preHookCallback, postHookCallback) {
        var fullName = '';
        if (obj[propertyName] != undefined) {
            fullName = hook.getObjName(obj) + "." + propertyName;
        }
        else {
            fullName = obj.name + "." + propertyName;
        }
        hook.nativePropertyList[fullName] = obj[propertyName];
        Object.defineProperty(obj, propertyName, {
            get: function () {
                if (!hook.checkStack()) {
                    return;
                }

                var objPropertyName = fullName;

                if (preHookCallback) {
                    preHookCallback(obj, propertyName, arguments, this);
                }
                else {
                    hook.preHookCallback(obj, propertyName, arguments, this);
                }

                hook.log(hook.pre, objPropertyName + ":>get", arguments, this);
                var ret = hook.nativePropertyList[objPropertyName];
                hook.log(hook.post, objPropertyName + ":>get", ret);

                if (postHookCallback) {
                    postHookCallback(obj, propertyName, arguments, this);
                }
                else {
                    hook.postHookCallback(obj, propertyName, arguments, this);
                }
                return ret;
            },
            set: function (val) {
                if (!hook.checkStack()) {
                    return;
                }

                var objPropertyName = hook.getObjName(this) + "." + propertyName;

                if (preHookCallback) {
                    preHookCallback(obj, propertyName, arguments, this);
                }
                else {
                    hook.preHookCallback(obj, propertyName, arguments, this);
                }

                hook.log(hook.pre, objPropertyName + ":>set", arguments, this);

                this[propertyName] = val;
                hook.nativePropertyList[objPropertyName] = val;

                hook.log(hook.post, objPropertyName + ":>set", '', val);

                if (postHookCallback) {
                    postHookCallback(obj, propertyName, arguments, this);
                }
                else {
                    hook.postHookCallback(obj, propertyName, arguments, this);
                }
            }
        })
    },

    hookAnyFunction: function (obj, funcName, preHookCallback, postHookCallback) {
        var fullName = '';
        if (obj[funcName] && funcName != 'constructor') {
            fullName = hook.getObjName(obj) + "." + funcName;
            hook.nativeFuncList[fullName] = obj[funcName];
            obj[funcName] = function () {
                if (!hook.checkStack()) {
                    return;
                }

                var objName = hook.getObjName(obj);
                var objFunName = objName + '->' + funcName;

                if (!hook.checkStack()) {
                    return;
                }

                if (preHookCallback) {
                    preHookCallback(objName, funcName, arguments, this);
                }
                else {
                    hook.preHookCallback(objName, funcName, arguments, this);
                }

                hook.log(hook.pre, objFunName, arguments, this);
                var ret = hook.nativeFuncList[fullName].apply(this, arguments);
                hook.log(hook.post, objFunName, ret);

                if (postHookCallback) {
                    postHookCallback(objName, funcName, arguments, this);
                }
                else {
                    hook.postHookCallback(objName, funcName, arguments, this, ret);
                }
                return ret;
            }
        }
        else {
            fullName = obj.name + "." + funcName;
            hook.nativeFuncList["prototype"][fullName] = obj["prototype"][funcName];
            obj["prototype"][funcName] = function () {
                if (!hook.checkStack()) {
                    return;
                }

                var objName = obj.name;
                var objFunName = objName + '->' + funcName;

                if (preHookCallback) {
                    preHookCallback(objName, funcName, arguments, this);
                }
                else {
                    hook.preHookCallback(objName, funcName, arguments, this);
                }

                hook.log(hook.pre, objFunName, arguments, this);
                var ret = hook.nativeFuncList["prototype"][fullName].apply(this, arguments);
                hook.log(hook.post, objFunName, ret);

                if (postHookCallback) {
                    postHookCallback(objName, funcName, arguments, this);
                }
                else {
                    hook.postHookCallback(objName, funcName, arguments, this, ret);
                }
                return ret;
            }
        }
    },

    getNativeFunc: function (func) {
        if (hook.nativeFuncList[func]) {
            return hook.nativeFuncList[func];
        }
        else {
            return hook.nativeFuncList["prototype"][func];
        }
    },

    log: function (type, func, args, context) {
        var whitespace = '    ';
        console.log(type + whitespace, func + whitespace, args, whitespace, context == undefined ? '' : context);
    },

    getObjName: function (obj) {
        return obj.toString().replace('[object ', '').replace("]", '');
    },

    checkStack: function () {
        var stack = (new Error()).stack;
        var stackArray = null;
        var nativeStringSplit = hook.getNativeFunc('String.split');
        if (nativeStringSplit) {
            stackArray = nativeStringSplit.call(stack, '\n');
        }
        else {
            stackArray = stack.split('\n');
        }
        if (hook.checkForDuplicates(stackArray)) {
            return false;
        }
        return true;
    },

    checkForDuplicates: function (array) {
        let list = [];
        for (let i = 0; i < array.length; i++) {
            let value = array[i];
            for (let j = 0; j < list.length; j++) {
                if (list[j] == value) {
                    return true;
                }
            }
            var nativeArrayPush = hook.getNativeFunc('Array.push');
            if (nativeArrayPush) {
                nativeArrayPush.call(list, value);
            }
            else {
                list.push(value);
            }
        }
        return false
    }
}