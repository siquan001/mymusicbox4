let MList={};

window.on("load",()=>{
    $(".page.ready .state").text("正在加载歌单...");
    get("musiclist.json").then(r=>{
        MList=r;
        $(".page.ready .state").text("点击进入");
        $(".page.ready .state").className="state";
        $(".page.ready").on("click",()=>{
            $(".page.ready").fadeOut(200);
            $(".page.group-p").fadeIn(200);
            $(".page.list-p").hide();
            // $(".page.list-p").fadeIn(200);
            // $(".page.group-p").hide(200);
            let b=new URL(location.href);
            if(b.searchParams.get("mid")){
                let mid=b.searchParams.get("mid");
                if(MList.musics[mid]){
                    openGroup("所有音乐");
                    for(let i=0;i<sortedList.length;i++){
                        if(mid==sortedList[i]){
                            playMusic(i);
                        }
                    }
                }
            }
            if("mediaSession" in navigator){
                let metadata = new MediaMetadata({
                    title: "雨竹音乐盒",
                    artist: "yz小雨竹",
                    artwork: []
                });
                navigator.mediaSession.metadata = metadata;
                navigator.mediaSession.setActionHandler("play",()=>{
                    MP.audio.play();
                });
                navigator.mediaSession.setActionHandler("pause",()=>{
                    MP.audio.pause();
                });
                navigator.mediaSession.setActionHandler("previoustrack",()=>{
                    MP.EL.$(".btn.lst").click();
                });
                navigator.mediaSession.setActionHandler("nexttrack",()=>{
                    MP.EL.$(".btn.nxt").click();
                });
                navigator.mediaSession.setActionHandler('seekbackward',  ()=>{
                    MP.audio.currentTime -= 10;
                });
                navigator.mediaSession.setActionHandler('seekforward',  ()=>{
                    MP.audio.currentTime += 10;
                });
            }
        })
        initGroup();
    }).catch(e=>{
        console.error(e);
        $(".page.ready .state").text("歌单加载失败");
        $(".page.ready .state").className="state error";
    })
})

window.on("resize",()=>{
    initGroupStyle();
    focusGroup(nowfocus);
})

initResize(_r)
function _r(w,h){
    let vh=h*0.01;
    if(vh===0){
        setTimeout(_r,50);
        return;
    }
    $("#sts").innerHTML=`body{
        --vh:${vh}px;
    }`
    if(w<h){
        $("body").addClass("zp");
    }else{
        $("body").removeClass("zp");
    }
}
let nowfocus=-1;
let group_size=-1;

function initGroup(){
    let gs=MList.group;
    let i=0;
    for(let name in gs){
        let ngel=el(".group",{
            "data-group":name,
            "data-i":i,
        })
        ngel.html(`<img src="" alt="">
        <div class="info">
            <div class="name"></div>
            <div class="desc"></div>
        </div>`)
        ngel.$("img").sr(gs[name].img);
        ngel.$(".name").text(name);
        ngel.$(".desc").text(gs[name].desc);
        $(".groups").append(ngel);
        ngel.on("click",function(){
            if(this.hasClass("selected")){
                openGroup(this.attr("data-group"));
            }else{
                focusGroup(parseInt(this.attr("data-i")));
            }
        })
        i++;
    }
    group_size=Object.keys(gs).length;
    initGroupStyle();
    focusGroup(0);
    $('.group-show .lst').on("click",()=>{
        if(nowfocus>0){
            focusGroup(nowfocus-1);
        }else{
            focusGroup(group_size-1);
        }
    })
    $('.group-show .nxt').on("click",()=>{
        if(nowfocus==group_size-1){
            focusGroup(0);
        }else{
            focusGroup(nowfocus+1);
        }
    })
}

function initGroupStyle(){
    if(!MList.group)return;
    const h=window.innerHeight*0.8;
    $('.groups').css("width",h*0.7*(group_size+1)+h*0.2+'px');
}

function focusGroup(i){
    if(i<0)return;
    nowfocus=i;
    const w=window.innerWidth;
    const h=window.innerHeight*0.8;
    $$('.groups .group').removeClass("selected");
    $$('.groups .group')[i].addClass("selected");
    $(".groups").css("left",w*0.5-h*0.45-i*h*0.7+'px');
}

let nowlistraw={};
let sortedList=[];
const SORT_DEF=0;
const SORT_NAME=1;
const SORT_ARTIST=2;
const SORT_SCORE=3;
let sortedType=SORT_DEF;
let sortedDir=1;
let nowplay=null;
let nowplayindex=-1;

function openGroup(gn){
    $(".page.list-p").fadeIn(200);
    $(".page.group-p").fadeOut(200);
    $(".list-p .left img").sr(MList.group[gn].img);
    $(".list-p .left .name").text(gn);
    $(".list-p .left .desc").text(MList.group[gn].desc);
    if(MList.group[gn].sp){
        if(MList.group[gn].sp=="all"){
            nowlistraw=cloneObj(MList.musics);
        }
    }else{
        nowlistraw={};
        let t=MList.group[gn].tag;
        for(let mid in MList.musics){
            let m=MList.musics[mid];
            for(let ta of t){
                if(m.tags.includes(ta)){
                    nowlistraw[mid]=cloneObj(m);
                    break;
                }
            }
        }
    }    
    resortList();
}

function resortList(){
    sortedList=[];
    for(let k in nowlistraw){
        sortedList.push(k);
    }
    switch(sortedType){
        case SORT_NAME:
            sortedList.sort((a,b)=>{
                a=MList.musics[a].name;
                b=MList.musics[b].name;
                return a.localeCompare(b);
            });
        break;
        case SORT_ARTIST:
            sortedList.sort((a,b)=>{
                a=MList.musics[a].artist;
                b=MList.musics[b].artist;
                return a.localeCompare(b);
            });
        break;
        case SORT_SCORE:
            sortedList.sort((a,b)=>{
                a=MList.musics[a].score;
                b=MList.musics[b].score;
                return a>b?1:-1;
            });
        break;
    }

    $(".page.list-p .list").html('');
    for(let i2=0;i2<sortedList.length;i2++){
        let i;
        if(sortedDir==1)i=i2;
        if(sortedDir==-1)i=sortedList.length-i2-1;
        let mid=sortedList[i];
        let it=el(".item",{
            "data-mid":sortedList[i],
            "data-i":i
        });
        it.html(`<div class="playing-svg">
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24"><rect width="2.8" height="12" x="1" y="6" fill="currentColor"><animate attributeName="y" begin="IconifyId19b1b819502215199113.begin+0.4s" calcMode="spline" dur="0.6s" keySplines=".14,.73,.34,1;.65,.26,.82,.45" values="6;1;6"/><animate attributeName="height" begin="IconifyId19b1b819502215199113.begin+0.4s" calcMode="spline" dur="0.6s" keySplines=".14,.73,.34,1;.65,.26,.82,.45" values="12;22;12"/></rect><rect width="2.8" height="12" x="5.8" y="6" fill="currentColor"><animate attributeName="y" begin="IconifyId19b1b819502215199113.begin+0.2s" calcMode="spline" dur="0.6s" keySplines=".14,.73,.34,1;.65,.26,.82,.45" values="6;1;6"/><animate attributeName="height" begin="IconifyId19b1b819502215199113.begin+0.2s" calcMode="spline" dur="0.6s" keySplines=".14,.73,.34,1;.65,.26,.82,.45" values="12;22;12"/></rect><rect width="2.8" height="12" x="10.6" y="6" fill="currentColor"><animate id="IconifyId19b1b819502215199113" attributeName="y" begin="0;IconifyId19b1b819502215199114.end-0.1s" calcMode="spline" dur="0.6s" keySplines=".14,.73,.34,1;.65,.26,.82,.45" values="6;1;6"/><animate attributeName="height" begin="0;IconifyId19b1b819502215199114.end-0.1s" calcMode="spline" dur="0.6s" keySplines=".14,.73,.34,1;.65,.26,.82,.45" values="12;22;12"/></rect><rect width="2.8" height="12" x="15.4" y="6" fill="currentColor"><animate attributeName="y" begin="IconifyId19b1b819502215199113.begin+0.2s" calcMode="spline" dur="0.6s" keySplines=".14,.73,.34,1;.65,.26,.82,.45" values="6;1;6"/><animate attributeName="height" begin="IconifyId19b1b819502215199113.begin+0.2s" calcMode="spline" dur="0.6s" keySplines=".14,.73,.34,1;.65,.26,.82,.45" values="12;22;12"/></rect><rect width="2.8" height="12" x="20.2" y="6" fill="currentColor"><animate id="IconifyId19b1b819502215199114" attributeName="y" begin="IconifyId19b1b819502215199113.begin+0.4s" calcMode="spline" dur="0.6s" keySplines=".14,.73,.34,1;.65,.26,.82,.45" values="6;1;6"/><animate attributeName="height" begin="IconifyId19b1b819502215199113.begin+0.4s" calcMode="spline" dur="0.6s" keySplines=".14,.73,.34,1;.65,.26,.82,.45" values="12;22;12"/></rect></svg>
</div> <div class="songname"></div><div class="songartist"></div>`);
        it.$(".songname").text(MList.musics[mid].name);
        it.$(".songartist").text(MList.musics[mid].artist);
        $('.page.list-p .list').append(it);

        it.on("click",function(){
            playMusic(parseInt(this.attr("data-i")));
        })
    }

    // setplaying
    if(nowplay){
        let q=$('.page.list-p .list [data-mid="'+nowplay+'"]');
        if(q)q.addClass("playing");
        nowplayindex=sortedList.indexOf(nowplay);
    }
}

$(".list-p .back-icon").on("click",()=>{
    $(".page.list-p").fadeOut(200);
    $(".page.group-p").fadeIn(200);
})

$(".list-p .topper .order").on("click",function(){
    if(sortedDir==1){
        sortedDir=-1;
        this.text("↓");
    }else if(sortedDir==-1){
        sortedDir=1;
        this.text("↑");
    }
    resortList();
})

$(".list-p .topper .sorter").on("click",function(){
    let ns=["默认","名称","歌手","喜爱程度"];
    if(sortedType==3)sortedType=0;
    else sortedType++;
    this.text(ns[sortedType]);
    resortList();
})


function playMusic(index){
    nowplayindex=index;
    nowplay=sortedList[index];
    let q=$('.page.list-p .list .playing');
    if(q)q.removeClass("playing");
    q=$('.page.list-p .list [data-mid="'+nowplay+'"]');
    if(q)q.addClass("playing");
    
    console.log(index,nowplay);
    let md=MList.musics[sortedList[index]];
    MP.show();
    MP.reset();
    MP.setName(md.name).setArtist(md.artist).setDesc(md.info).setTags(md.tags).setScore(md.score);
    if(md.tags.includes("纯音乐")){
        MP.EL.addClass("pure");
    }else{
        MP.EL.removeClass("pure");
    }
    document.title=md.name+" - "+md.artist;
    history.replaceState({}, "", "?mid="+nowplay);
    $(".floatb .name").text(md.name);
    $(".floatb .artist").text(md.artist);
    $(".floatb img").css("opacity",0);
    if ("mediaSession" in navigator) {
        let metadata = new MediaMetadata({
            title: md.name,
            artist: md.artist,
            artwork: []
        });
        navigator.mediaSession.metadata = metadata;
    }
    musicAll.get(md.getter,{
        music(url){
            if(!url) throw "Get Music Failed";
            MP.play(url.replace("http://","https://"));
        },
        img(url){
            if(!url) throw "Get Cover Failed";
            url=url.replace("?param=300x300",'').replace("http://","https://");
            MP.setCover(url);
            $(".floatb img").sr(url);
            let img=url
            if ("mediaSession" in navigator) {
                let metadata = new MediaMetadata({
                    title: md.name,
                    artist: md.artist,
                    artwork: [
                        { src: img, sizes: "256x256", type: "image/jpeg" }
                    ]
                });
                navigator.mediaSession.metadata = metadata;
            }
        },
        lrc(lrcstr){
            if(!lrcstr){
                MP.setLrc("[00:00.00] 暂无歌词");
            }else{
                MP.setLrc(lrcstr);
            }
        },
        trc(transtr){
            MP.setTrans(transtr);
        }
    })
    
}

const LIGHT=1;
const DARK=0;
const LOOP=0;
const LOOP_1=1;
const RANDOM=2;
const MP={
    evs:{},
    st:{
        url:null,
        img:null,
        lrc:null,
        lrcstr:null,
        trans:null,
        transtr:null,
        theme:LIGHT,
        mode:LOOP,
        usetrans:false,
        useimgbg:false,
        usebgblur:false,
        usemaincolor:false,
        maincolor:null,
        uselowmode:false,
        spinspeed:6,
        infos:{
            name:null,
            artist:null,
            desc:null,
            score:null,
            tags:[],
        }
    },
    EL:$(".musicplayer"),
    audio:$(".musicplayer audio"),
    play(url){
        if(typeof url=="string"){
            this.st.url=url;
            this.audio.sr(url);
        }else
        if(typeof url=="number"){
            if(url==-1){
                this.audio.src=null;
                this.audio.pause();
            }else{
                this.reset();
                this._do("setplay",url);
            }
        }else{
            this.audio.play();
        }
        return this;
    },
    pause(){
        this.audio.pause();
        return this;
    },
    setName(name){
        this.st.infos.name=name;
        name=name||"- Title -";
        this.EL.$(".controls .songname").text(name);
        this.EL.$(".tbl.songname .value").text(name);
        return this;
    },
    setArtist(artist){
        this.st.infos.artist=artist;
        artist=artist||"- Artist -";
        this.EL.$(".controls .songartist").text(artist);
        this.EL.$(".tbl.songartist .value").text(artist);
        return this;
    },
    setDesc(desc){
        this.st.infos.desc=desc;
        desc=desc||"-";
        this.EL.$(".tbl.songdesc .value").text(desc);
        return this;
    },
    setTags(tags){
        this.st.infos.tags=tags;
        let a=this.EL.$(".tbl.songtags .value");
        a.html('');
        tags.forEach(t=>{
            let ta=el(".tag");
            ta.text(t);
            a.append(ta);
        })
        return this;
    },
    setScore(score){
        this.st.infos.score=score;
        score=score||"-";
        this.EL.$(".tbl.songscore .value").text(score);
        return this;
    },
    setLrc(lrc){
        this.st.lrcstr=lrc;
        this.st.lrc=musicAll.parseLrc(lrc);
        let lr=this.EL.$(".lrclist");
        lr.html('');
        for(let k in this.st.lrc){
            let l=this.st.lrc[k];
            let r=el(".item");
            r.attr("data-k",k);
            r.html(`<div class="yrc"></div><div class="trc"></div>`)
            r.$(".yrc").text(l);
            lr.append(r);
        }
        if(this.st.transtr){
            this.setTrans(this.st.transtr);
        }
        return this;
    },
    setTrans(trans){
        this.st.transtr=trans;
        this.st.trans=musicAll.parseLrc(trans);
        if(trans){
            this.EL.$(".btn.fanyi").show();
            if(this.st.usetrans){
                this.EL.$(".lrclist").addClass("trans");
            }
        }else{
            this.EL.$(".btn.fanyi").hide();
            this.EL.$(".lrclist").removeClass("trans");
            return this;
        }
        
        this.EL.$$(".lrclist .trc").html('');
        let q=this.EL.$$(".lrclist .trc");
        let sti=0;
        try {
            for(let k in this.st.trans){
                // if(!this.st.trans[k])continue;
                for(let i=sti;i<q.length;i++){
                    let k2=q[i].parent().attr("data-k");k2=parseFloat(k2);
                    if(Math.abs(k-k2)<0.1){
                        sti=i;
                        q[i].text(this.st.trans[k]);
                    }
                }
            }
        } catch (error) { }
        return this;
    },
    setTheme(theme){
        this.st.theme=theme;
        if(theme==LIGHT){
            this.EL.removeClass("dark");
            this.EL.$(".btnsvg.dark").addClass("hide");
            this.EL.$(".btnsvg.light").removeClass("hide");
        }else{
            this.EL.addClass("dark");
            this.EL.$(".btnsvg.dark").removeClass("hide");
            this.EL.$(".btnsvg.light").addClass("hide");
        }
        this._do("theme",theme);
        return this;
    },
    setPlayMode(mode){
        this.st.mode=mode;
        let cts=["loop","loop-1","random"];
        this.EL.$$(".btn.playmode .btnsvg").addClass("hide");
        this.EL.$$(".btnsvg."+cts[mode]).removeClass("hide");
        return this;
    },
    setUseTrans(b){
        this.st.usetrans=b;
        if(b){
            this.EL.$(".btn.fanyi").addClass("active");
        }else{
            this.EL.$(".btn.fanyi").removeClass("active");
            this.EL.$(".lrclist").removeClass("trans");
        }
        if(b&&this.st.transtr){
            this.EL.$(".lrclist").addClass("trans");
        }
        return this;
    },
    setCover(img){
        this.st.img=img;
        if(img){
            this.EL.$(".cover img").sr(img);
            // this.EL.$(".blurbg img").sr(img);
            this.colorfulImg(img,(m1,m2,m3,m)=>{
                console.log(m1,m2,m3,m);
                this.setTheme(m?LIGHT:DARK);
                this.setMainColor(['rgb('+m3+")",'rgb('+m2+")",'rgb('+m2+")",'rgb('+m3+")"])
            })
        } 
        this.EL.$(".cover img").css("opacity",0);
        return this;
    },
    switchMainColor(b){
        this.st.usemaincolor=b;
        if(b&&this.st.maincolor){
            this.setMainColor(this.st.maincolor);
        }else{
            $("style#mp_maincolor").html('');
        }
        return this;
    },
    setMainColor(colors){
        this.st.maincolor=colors;
        if(this.st.usemaincolor&&colors){
            $("style#mp_maincolor").text(`body,body *,body *::after,body *::before{
                --bgcolor:${this.st.maincolor[0]};
                --textcolor:${this.st.maincolor[1]};
            }
            body.dark,body.dark *,body.dark *::after,body.dark *::before{
                --bgcolor:${this.st.maincolor[2]};
                --textcolor:${this.st.maincolor[3]};
            }`)
        }
        
        return this;
    },
    reset(){
        this.EL.removeClass("playing");
        this.EL.$(".btn.fanyi").hide();
        this.setName(null)
        .setArtist(null)
        .setCover(null)
        .setLrc(null)
        .setDesc(null)
        .setScore(null)
        .setTags([])
        .setTrans(null)
        .play(-1);
        
        return this;
    },
    colorfulImg:function(img,cb){
        let imgEl = document.createElement('img');
        imgEl.src = img;
        imgEl.crossOrigin = 'Anonymous';
        imgEl.referrerPolicy = 'no-referrer';
        imgEl.onload = function () {
            try {
                let canvas = document.createElement('canvas'),
                    context = canvas.getContext && canvas.getContext('2d'),
                    height, width, length, data,
                    i = -4,
                    blockSize = 10,
                    count = 0,
                    rgb = { r: 0, g: 0, b: 0 }
                height = canvas.height = imgEl.height
                width = canvas.width = imgEl.width
                context.drawImage(imgEl, 0, 0);
                data = context.getImageData(0, 0, width, height).data
                length = data.length
                while ((i += blockSize * 4) < length) {
                    ++count;
                    rgb.r += data[i];
                    rgb.g += data[i + 1];
                    rgb.b += data[i + 2];
                }
                rgb.r = ~~(rgb.r / count);
                rgb.g = ~~(rgb.g / count);
                rgb.b = ~~(rgb.b / count);
                var m=(rgb.r + rgb.g + rgb.b) / 3 > 150;
                function ccl(c){
                    return 256-(256-c)/2;
                }
                var m1=(rgb.r)+','+(rgb.g)+','+(rgb.b);
                var m2=(rgb.r/2)+','+(rgb.g/2)+','+(rgb.b/2);
                var m3=ccl(rgb.r)+','+ccl(rgb.g)+','+ccl(rgb.b);
                // if((rgb.r + rgb.g + rgb.b) / 1.5 < 150){
                //     m3='255,255,255';
                // }
                cb(m1,m2,m3,m);
            } catch (e) {
                console.warn(e);
                d();
            }
        }
        imgEl.onerror = function () {
            d();
        }
        function d() {
            if(img.indexOf('http')==-1)return cb('rgba(0,0,0,0)', -1);
            musicAll.ajax('https://uapis.cn/api/v1/image/tobase64',{url: img}).then(function (n) {
                if (!n) {
                    cb('rgba(0,0,0,0)', -1);
                } else {
                    var base64 = n.base64;
                    MP.colorfulImg(base64, cb);
                }
            })
        }
    },
    on(event,fn){
        if(this.evs[event]){
            this.evs[event].push(fn);
        }else{
            this.evs[event]=[fn];
        }
    },
    _do(ev,q){
        if(!Array.isArray(q))q=[q];
        if(this.evs[ev])this.evs[ev].forEach(a=>a.apply(this,q));
    },
    show(){
        this.EL.addClass("show");
    },
    hide(){
        this.EL.removeClass("show");
    },
    _init(){
        this.EL.$(".btn.close").on("click",()=>{
            this.hide();
        })
        this.EL.$(".btn.fanyi").on("click",()=>{
            if(this.st.usetrans){
                this.setUseTrans(false);
            }else{
                this.setUseTrans(true);
            }
        })
        this.EL.$(".btn.playmode").on("click",()=>{
            if(this.st.mode>=2){
                this.setPlayMode(0);
            }else{
                this.setPlayMode(this.st.mode+1);
            }
        })
        this.EL.$(".btn.theme").on("click",()=>{
            if(this.st.theme==LIGHT){
                this.setTheme(DARK);
            }else{
                this.setTheme(LIGHT);
            }
        })
        this.EL.$(".btn.full").on("click",()=>{
            if(document.fullscreenElement){
                document.exitFullscreen();
            }else{
                document.body.requestFullscreen();
            }
        })
        document.on("fullscreenchange",()=>{
            if(document.fullscreenElement){
                this.EL.$(".btn.full .unfull").removeClass("hide");
                this.EL.$(".btn.full .tofull").addClass("hide");
            }else{
                this.EL.$(".btn.full .tofull").removeClass("hide");
                this.EL.$(".btn.full .unfull").addClass("hide");
            }
        })
        this.audio.on("play",()=>{
            this.EL.addClass("playing");
            this.EL.$(".btn.play .btnsvg.playing").removeClass("hide");
            this.EL.$(".btn.play .btnsvg.pausing").addClass("hide");
        })
        this.audio.on("pause",()=>{
            this.EL.removeClass("playing");
            this.EL.$(".btn.play .btnsvg.playing").addClass("hide");
            this.EL.$(".btn.play .btnsvg.pausing").removeClass("hide");
        })
        this.EL.$(".btn.play").on("click",()=>{
            if(this.audio.paused){
                this.audio.play();
            }else{
                this.audio.pause();
            }
        })
        const a0=a=>a<10?("0"+a):a;
        this.audio.on("canplay",()=>{
            this.play();
            let d=this.audio.duration;d=Math.floor(d);
            this.EL.$(".time .r").text(a0(Math.floor(d/60))+":"+a0(d%60));
        })
        let draging=false;
        this.audio.on("timeupdate",()=>{
            let d=this.audio.currentTime;
            let p=d/this.audio.duration;
            p*=100;
            d=Math.floor(d);
            if(!draging){
                this.EL.$(".time .l").text(a0(Math.floor(d/60))+":"+a0(d%60));
                this.EL.$(".range .r1").css("width",p+"%");
                this.EL.$(".range .r2").css("left",p+"%");
            }
            
            // lrc
            var i = -1;
            for (var k in this.st.lrc) {
                k=parseFloat(k);
                if (d+1 < k) {
                    break;
                }
                i++;
            }
            let rli=this.EL.$('.lrclist .item.now');
            let _=this;
            let tli;
            if(i!=-1){
                tli=this.EL.$$('.lrclist .item')[i];
                if(tli.hasClass('now')){
                    return then();
                }else{
                    rli&&rli.removeClass('now');
                }
                tli.addClass('now');
            }else{
                rli&&rli.removeClass('now');
                tli=this.EL.$('.lrclist .item');
            }
            function then(){
                rli=null;
                var tlitop=tli.offsetTop+tli.getRect().height*.5;
                _.EL.$(".lrclist").css("transform","translateY(calc((46 * var(--vh)) - "+tlitop+"px))");
                tli=null;
            }
            then();
        })

        this.EL.$(".range").on("click",(e)=>{
            if(isNaN(this.audio.duration)){
                return;
            }
            let x=e.offsetX;
            let p=x/this.EL.$(".range").getRect().width;
            this.audio.currentTime=p*this.audio.duration;
        })
        this.EL.$(".range .r2").on("click",(e)=>e.stopPropagation());
        this.EL.$(".range .r2").on("mousedown",(ev)=>{
            if(isNaN(this.audio.duration)){
                return;
            }
            ev.stopPropagation();
            draging=true;
            let bd=this.EL.$(".range").getRect();
            document.onmousemove=(e)=>{
                let x=e.pageX-bd.left;
                if(x>bd.width)x=bd.width;
                let p=x/bd.width;
                let d=this.audio.duration*p;
                d=Math.floor(d);
                p*=100;
                this.EL.$(".time .l").text(a0(Math.floor(d/60))+":"+a0(d%60));
                this.EL.$(".range .r1").css("width",p+"%");
                this.EL.$(".range .r2").css("left",p+"%");
            }
            document.onmouseup=(e)=>{
                document.onmousemove=null;
                document.onmouseup=null;
                draging=false;
                let x=e.pageX-bd.left;
                if(x>bd.width)x=bd.width;
                let p=x/bd.width;
                let d=this.audio.duration*p;
                this.audio.currentTime=d;
            }
        })
        let _=this;
        this.EL.$(".cover img").on("load",function(){
            this.css("opacity",1);
        })

        this.EL.$(".tab.t-player").on("click",()=>{
            this.EL.$$(".tab").removeClass("active");
            this.EL.$(".tab.t-player").addClass("active");
            this.EL.removeClass("showinfo");
            this.EL.removeClass("showlrc");
        })
        this.EL.$(".tab.t-info").on("click",()=>{
            this.EL.$$(".tab").removeClass("active");
            this.EL.$(".tab.t-info").addClass("active");
            this.EL.removeClass("showlrc");
            this.EL.addClass("showinfo");
        })
        this.EL.$(".tab.t-lrc").on("click",()=>{
            this.EL.$$(".tab").removeClass("active");
            this.EL.$(".tab.t-lrc").addClass("active");
            this.EL.addClass("showlrc");
            this.EL.removeClass("showinfo");
        })

        this.EL.$(".btn.lst").on("click",()=>{
            this.reset();
            this._do("lst",{mode:this.st.mode});
        })
        this.EL.$(".btn.nxt").on("click",()=>{
            this.reset();
            this._do("nxt",{mode:this.st.mode});
        })

        this.audio.on("ended",()=>{
            if(this.st.mode==LOOP_1){
                this.audio.currentTime=0;
                this.audio.play();
            }else{
                this.EL.$(".btn.nxt").click();
            }
        })

        document.body.append(el("style#mp_maincolor"));

    }
}
MP._init();
MP.switchMainColor(true);
MP.setUseTrans(true);

MP.on("lst",(e)=>{
    if(e.mode==RANDOM){
        playMusic(Math.floor(Math.random()*sortedList.length));
    }else{
        if(nowplayindex<=0){
            playMusic(sortedList.length-1);
        }else{
            playMusic(nowplayindex-1);
        }
    }
})

MP.on("nxt",(e)=>{
    if(e.mode==RANDOM){
        playMusic(Math.floor(Math.random()*sortedList.length));
    }else{
        if(nowplayindex>=sortedList.length-1){
            playMusic(0);
        }else{
            playMusic(nowplayindex+1);
        }
    }
})

MP.audio.on("play",()=>{
    $(".floatb .cover").addClass("playing");
})
MP.audio.on("pause",()=>{
    $(".floatb .cover").removeClass("playing");
})



$(".floatb").on("click",()=>{
    MP.show();
});

$(".floatb img").on("load",function(){
    this.css("opacity",1);
})

MP.on("theme",(theme)=>{
    if(theme==DARK){
        document.body.addClass("dark");
    }else{
        document.body.removeClass("dark");
    }
})

document.on("visibilitychange",()=>{
    if(document.hidden){
        document.body.hide();
    }else{
        document.body.show();
    }
})

window.on("focus",()=>{
   document.body.removeClass("perf"); 
});

window.on("blur",()=>{
    document.body.addClass("perf");
})

window.on('beforeunload', () => {
    MP.audio.pause();
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = null;
    }
});