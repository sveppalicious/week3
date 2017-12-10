module.exports=function(injected){
    const cacheSize = injected('cacheSize');

    return function(){

        let cache={

        };
        let keys=[];
        return {
            add: function(key, obj){
                cache[key] = obj;
                if(keys.length >= cacheSize){
                    let key = keys.shift();
                    delete cache[key];
                }
                if(keys.indexOf(key)<0){
                    keys.push(key);
                }
            },
            get:function(key){
                return cache[key]
            }
        }
    }

};