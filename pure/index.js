let m;
let sl=[];
let nowplayindex=-1;
let nowplay="";
let audio=$("audio");
fetch("../musiclist-min.json").then(res => res.json()).then(data => {
    m = data.musics;
    sl=Object.keys(m);
    playMusic(0);
    let s=$(".playlist .list");
    for(let id of sl){
        let n=el(".item",{
            "data-id":id
        },`<div class="item-n">${m[id].name}</div><div class="item-a">${m[id].artist}</div>`,s);
        n.on("click",()=>{
            playMusic(id);
            $(".playlist").removeClass("show");
        })
    }
});

function playMusic(id){
    if(typeof id=="number"){
        nowplayindex=id;
        id=sl[id];
    }
    if((!id)||!m[id])return;
    nowplayindex=sl.indexOf(id);
    nowplay=id;

    $(".songname").text(m[id].name);
    $(".artist").text(m[id].artist);
    $$(".playlist .item.active").removeClass("active");
    try{$(".playlist .item[data-id='"+id+"']").addClass("active");}catch(e){}
    let hd=[];
    musicAll.get(m[id].getter,{
        music(url){
            if(hd[0])return;
            if(nowplay!=id)return;
            if(!url){
                // todo
                return;
            }
            audio.sr(url);
            hd[0]=1;
        },
        img(url){
            if(hd[1])return;
            if(nowplay!=id)return;
            if(!url){
                // todo
                return;
            }
            $("img").sr(url);
            hd[1]=1;
        }
    })
}

let playBy="ORDERED";
audio.on("ended",()=>{
    next();
})

audio.on("canplay",()=>{
    try {
        audio.play();    
    } catch (error) {
        // todo
    }
})

function next(){
    if(playBy=="ORDERED"){
        if(nowplayindex==sl.length-1){
            playMusic(0);
        }else{
            playMusic(nowplayindex+1);
        }
    }else if(playBy=="RANDOM"){
        playMusic(Math.floor(Math.random()*sl.length));
    }
}

function last(){
    if(playBy=="ORDERED"){
        if(nowplayindex==0){
            playMusic(sl.length-1);
        }else{
            playMusic(nowplayindex-1);
        }
    }else if(playBy=="RANDOM"){
        playMusic(Math.floor(Math.random()*sl.length));
    }
}

$(".btn.l").on("click",last);
$(".btn.n").on("click",next);
$(".btn.s").on("click",()=>{
    if(playBy=="ORDERED"){
        playBy="RANDOM";
        $(".btn.s span").text("随机");
    }else if(playBy=="RANDOM"){
        playBy="ORDERED";
        $(".btn.s span").text("顺序");
    }
});

$(".btn.p").on("click",()=>{
    $(".playlist").addClass("show");
})

$(".playlist").on("click",()=>{
    $(".playlist").removeClass("show");
})

$(".playlist .list").on("click",(e)=>e.stopPropagation());