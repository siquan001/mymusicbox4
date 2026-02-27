(function(e){
    if(!window.qui){
        window.qui=e();
        qui.pushObj(qui,window);
    }
})(function(){

    var sq={
        about:{
            name:"qui",
            version:"1.1.0",
            author:"siquan",
            desc:"web开发辅助工具库"
        },
        initResize:function(fn=function(){}){
            function resize(){
                var w=window.innerWidth;
                var h=window.innerHeight;
                document.body.css('width',w+"px");
                document.body.css('height',h+"px");
                fn(w,h);
            }
            
            window.onresize=resize;
            resize();
        },
        js(code,isurl){
            if(isurl){
                this.el('script',{src:code},'',document.body);
            }else{
                this.el('script',{},code,document.body);
            }
        },
        css(styles,isurl){
            if(isurl){
                this.el('link',{rel:"stylesheet",href:styles},'',document.head);
            }else{
                this.el('style',{},styles,document.head);
            }
        },
        $:function(selector){
            return document.querySelector(selector);
        },
        $$:function(selector){
            return document.querySelectorAll(selector);
        },
        el:function(ctag,attrs,inner,parent){
            let tag='',classes=[],id='',lst=[0,0];
            for(let i=0;i<ctag.length;i++){
                if(ctag[i]=='#'||ctag[i]=='.'){
                    if(tag==''){
                        tag=ctag.slice(0,i)||"div";
                    }
                    if(lst[0]==1){
                        classes.push(ctag.slice(lst[1],i));
                    }else if(lst[0]==2){
                        id=ctag.slice(lst[1],i);
                    }
                    lst[1]=i+1;
                    lst[0]=ctag[i]=='#'?2:1;
                }
            }
            if(lst[0]==1){
                classes.push(ctag.slice(lst[1]));
            }else if(lst[0]==2){
                id=ctag.slice(lst[1]);
            }
            let be=document.createElement(tag);
            if(classes.length>0)be.className=classes.join(" ");
            if(id)be.id=id;
            if(attrs){
                for(let k in attrs){
                    be.setAttribute(k,attrs[k]);
                }
            }
            if(inner){
                be.innerHTML=inner;
            }
            if(parent){
                parent.append(be);
            }
            return be;
        },
        timeDo:function(fn,time=0,iswhile=false){
            if(iswhile){
                return setInterval(function(){
                    fn();
                },time);
            }else{
                return setTimeout(function(){
                    fn();
                },time);
            }
        },
        /**
         * 对象合并
         * @param {Object} obj 需要合并的对象
         * @param {Object} target 目标对象
         * @param {Boolean} rewrite 是否覆盖目标对象
         */
        pushObj:function pushObj(obj,target,rewrite=false){
            if(rewrite){
                for(var key in obj){
                    if(target.hasOwnProperty(key)){
                        delete target[key];
                        target[key]=obj[key];
                    }
                }
            }else{
                for(var key in obj){
                    if(!target.hasOwnProperty(key)){
                        target[key]=obj[key];
                    }
                }
            }
        },
        cloneObj:function cloneObj(obj){
            var newObj={};
            for(var key in obj){
                if(typeof obj[key]==="object"&&obj[key]!==null){
                    newObj[key]=this.cloneObj(obj[key]);
                }else{
                    newObj[key]=obj[key];
                }
            }
            return newObj;
        },
        /**
         * 将伪数组转换为真数组
         * @param {*} arr 伪数组
         * @returns {Array} 真数组
         */
        ToRealArray:function ToRealArray(arr){
            return Array.prototype.slice.call(arr);
        },
    
        /**
         * 循环执行函数
         * @param {Function} func 循环执行的函数
         */
        whiledo:function whiledo(func){
            requestAnimationFrame(function(){
                func();
                whiledo(func);
            })
        },
        /**
         * 请求
         * @param {"GET"|"POST"} method 请求方法
         * @param {String} url 
         * @param {*} data? post数据
         * @param {"json"|"text"|""} type? 返回数据类型，默认json
         * @param {Function} progressListener? 进度监听器，可选
         * @returns {Promise} 返回Promise对象
         */
        ajax:function ajax(method,url,data,type="json",progressListener){
            return new Promise(function(resolve,reject){
                var xhr=new XMLHttpRequest();
                xhr.open(method,url);
                xhr.onload=function(){
                    if(xhr.status==200){
                        if(type=="json"){
                            try {
                                var j=toobj(xhr.responseText);
                            } catch (error) {
                                reject(error);
                                return;
                            }
                            resolve(j);
                        }else{
                            resolve(xhr.responseText);
                        }
                    }else{
                        reject(xhr);
                    }
                }
                xhr.onerror=function(){
                    reject(xhr);
                }
                if(progressListener){
                    xhr.onprogress=function(ev){
                        progressListener(ev.loaded/ev.total);
                    }
                }
                xhr.send(data);
            })
        },
        /**
         * get
         * @param {String} url 
         * @param {"json"|"text"|""} type? 返回数据类型，默认json
         * @param {Function} progressListener? 进度监听器，可选
         * @returns {Promise} 返回Promise对象
         */
        get:function get(url,type="json",progressListener){
            return ajax("GET",url,void 0,type,progressListener);
        },
    
        /**
         * post
         * @param {String} url 
         * @param {*} data post数据
         * @param {"json"|"text"|""} type? 返回数据类型，默认json
         * @param {Function} progressListener? 进度监听器，可选
         * @returns {Promise} 返回Promise对象
         */
         post:function post(url,data,type="json",progressListener){
            return ajax("POST",url,data,type,progressListener);
        },
        /**
         * 将对象转换为json字符串
         * @param {Object} obj 对象
         * @returns {String} 返回json字符串
         * @throws {Error} 如果对象格式不正确，则抛出错误
         */
        tojson:function tojson(obj){
            return JSON.stringify(obj);
        },
    
        /**
         * 将json字符串转换为对象
         * @param {String} json json字符串
         * @returns {Object} 返回对象
         * @throws {Error} 如果json字符串格式不正确，则抛出错误
         */
        toobj:function toobj(json){
            return JSON.parse(json);
        },

        isUd:function(a){
            return typeof a=='undefined';
        },

        isNl:function(a){
            return (!a)&&typeof a=='object';
        },

        isNum:function(a,unstrict=false){
            return unstrict?(!isNaN(a-0)):typeof a=='number';
        },

        getRandomCode(){
            return Date.now().toString(36)+Math.random().toString(36).slice(2);
        }
    }
    
    // 扩展
    var el_ex={
        css:function(a,b){
            if(this._css===undefined){
                this._css={};
            }
            if(typeof a==="string"){
                if(b===undefined){
                    return getComputedStyle(this)[a];
                }else{
                    this._css[tftogx(a)]=b;
                    this.attr('style',geCss(this._css))
                }
            }else if(typeof a==="object"){
                for(var key in a){
                    this._css[tftogx(key)]=a[key];
                }
                this.attr('style',geCss(this._css))
            }else{
                this.attr('style','');
            }
            function geCss(css){
                var str="";
                for(var key in css){
                    str+=key+":"+css[key]+";";
                }
                return str;
            }

            function tftogx(a){
                let b={
                    A:"a",
                    B:"b",
                    C:"c",
                    D:"d",
                    E:"e",
                    F:"f",
                    G:"g",
                    H:"h",
                    I:"i",
                    J:"j",
                    K:"k",
                    L:"l",
                    M:"m",
                    N:"n",
                    O:"o",
                    P:"p",
                    Q:"q",
                    R:"r",
                    S:"s",
                    T:"t",
                    U:"u",
                    V:"v",
                    W:"w",
                    X:"x",
                    Y:"y",
                    Z:"z"
                }
                for(let k in b){
                    a=a.replaceAll(k,'-'+b[k]);
                }
                return a;
            }
        },
        attr:function(key,value){
            if(typeof value!=="undefined"){
                this.setAttribute(key,value);
                return this;
            }else{
                return this.getAttribute(key)||null;
            }
        },
        hasClass:function(cls){
            return this.classList.contains(cls);
        },
        addClass:function(cls){
            this.classList.add(cls);
            return this;
        },
        removeClass:function(cls){
            this.classList.remove(cls);
            return this;
        },
        toggleClass:function(cls){
            this.classList.toggle(cls);
            return this;
        },
        html:function(html){
            if(!isUd(html)){
                this.innerHTML=html;
                return this;
            }else{
                return this.innerHTML;
            }
        },
        text:function(text){
            if(!isUd(text)){
                this.textContent=text;
                return this;
            }else{
                return this.textContent;
            }
        },
        val:function(value){
            if(!isUd(value)){
                this.value=value;
                return this;
            }else{
                return this.value;
            }
        },
        sr:function(src){
            if(!isUd(src)){
                this.src=src;
                return this;
            }else{
                return this.src;
            }
        },
        parent:function(){
            return this.parentNode;
        },
        child:function(){
            return this.children;
        },
        next:function(){
            return this.nextElementSibling;
        },
        prev:function(){
            return this.previousElementSibling;
        },
        index:function(){
            var index=0;
            var el=this;
            while(el.previousElementSibling){
                el=el.previousElementSibling;
                index++;
            }
            return index;
        },
        show:function(display="block"){
            this.css("display",display);
            return this;
        },
        fadeIn:function(time=300,display="block"){
            this.show(display);
            var _=this;
            sq.timeDo(function(){
                _.css('opacity','1');
            },time)
            return this;
        },
        fadeOut:function(time=300){
            this.css('opacity','0');
            var _=this;
            sq.timeDo(function(){
                _.css('display','none');
            },time)
            return this;
        },
        hide:function(){
            this.css("display","none");
            return this;
        },
        prepend:function(el){
            this.insertBefore(el,this.firstChild);
            return this;
        },
        insertAfter:function(el,node){
            this.insertBefore(el,node.nextSibling);
            return this;
        },
        getRect:function(){
            return this.getBoundingClientRect();
        },
        appendAfter:function(el){
            this.parent().insertAfter(el,this);
            return this;
        },
        appendBefore:function(el){
            this.parent().insertBefore(el,this);
            return this;
        },
        rm:function(){
            this.remove();
        },
        $:function(selector){
            return this.querySelector(selector);
        },
        $$:function(selector){
            return this.querySelectorAll(selector);
        },
        bind:function(binder){
            QE.bind(this,binder);
            return this;
        }
    }
    
    // 扩展到原型链上
    for(var key in el_ex){
        HTMLElement.prototype[key]=el_ex[key];
    }

    EventTarget.prototype.on=function(type,listener){
        if(!this._q_evs){
            this._q_evs={};
        }
        if(!this._q_evs[type]){
            this._q_evs[type]=[];
            this.addEventListener(type,function(){
                for(let i=0;i<this._q_evs[type].length;i++){
                    this._q_evs[type][i].apply(this,arguments);
                }
            });
        }
        this._q_evs[type].push(listener);
        return this;
    }
    
    EventTarget.prototype.off=function(type,listener){
        if(!this._q_evs){
            this._q_evs={};
        }
        if(typeof type=='undefined'){
            for(let k in this._q_evs){
                this._q_evs[k]=[];
            }
        }else{
            let n=this._q_evs[type];
            if(n){
                if(typeof listener=='undefined'){
                    n=[];
                }else if(typeof listener=='number'){
                    n.slice(listener,1); 
                }else if(typeof listener=='function'){
                    for(let i=0;i<n.length;i++){
                        if(n[i]===listener){
                            n.slice(i,1);
                            break;
                        }
                    }
                }
                this._q_evs[type]=n;
            }
        }
        return this;
    }

    EventTarget.prototype.doevent=function(type,argu){
        if(this._q_evs[type]){
            for(let i=0;i<this._q_evs[type].length;i++){
                this._q_evs[type][i].apply(this,argu);
            }
        }
    }
    
    // 扩展到原型链上
    let el_keys=Object.keys(el_ex);
    el_keys.push('on','off','doevent');
    for(var key of el_keys){
        (function(key){
            HTMLCollection.prototype[key]=NodeList.prototype[key]=function(){
                var ret=[];
                for(var i=0;i<this.length;i++){
                    ret.push(this[i][key].apply(this[i],arguments));
                }
                return ret;
            };
        })(key)
    }

    HTMLCollection.prototype.active=NodeList.prototype.active=function(node,cn){
        if(node instanceof HTMLElement){
            for(var i=0;i<this.length;i++){
                if(this[i]===node){
                    this[i].addClass(cn);
                }else{
                    this[i].removeClass(cn);
                }
            }
        }else if(typeof node==="string"){
            for(var i=0;i<this.length;i++){
                if(this[i].dataset.name===node){
                    this[i].addClass(cn);
                }else{
                    this[i].removeClass(cn);
                }
            }
        }else if(typeof node==="number"){
            for(var i=0;i<this.length;i++){
                if(i===node){
                    this[i].addClass(cn);
                }else{
                    this[i].removeClass(cn);
                }
            }
        }else if(!node){
            for(var i=0;i<this.length;i++){
                this[i].removeClass(cn);
            }
        }
        
    }
    
    var str_ex={
        toObj:function(){
            return JSON.parse(this.valueOf());
        }
    }
    
    // 扩展到String原型链上
    for(var key in str_ex){
        String.prototype[key]=str_ex[key];
    }

    // QElement
    let QE={
        qes:{},
        register:function(bindname,details){
            this.qes[bindname]=details;
            $$('[data-bind="'+bindname+'"]').bind(bindname);
        },
        bind:function(el,binder){
            this.qes[binder].init(el);
        }
    }

    sq.QE=QE;

    return sq;
});