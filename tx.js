let canvas,ctx;

function init(){
    canvas=document.createElement('canvas');
    document.body.appendChild(canvas);
    ctx=canvas.getContext('2d');
    let s=document.createElement('style');
    s.innerHTML='canvas{position:fixed;top:0;left:0;z-index:999;pointer-events:none;}';
    document.head.appendChild(s);
    
    function r(){
        canvas.width=window.innerWidth;
        canvas.height=window.innerHeight;
    }
    
    window.addEventListener('resize',r);
    r();
}

init();

const txs={
    randomBlock(details){
        let d=details.num||10;
        for(let i=0;i<d;i++){
            // select a random pos
            let x=Math.random()*canvas.width;
            let y=Math.random()*canvas.height;
            // select a random S from details.min?5 to details.max?20
            let S=Math.random()*(details.max?details.max:20)+(details.min?details.min:5);
            // select a random width from 1 to S
            let w=Math.random()*(S-1)+1;
            let h=S/w;
            // draw a random color or details.color block
            ctx.fillStyle=details.color?details.color:("#"+Math.random().toString(16).slice(2,8));
            ctx.fillRect(x,y,w,h);

        }
    },
    randomLine(details){
        let d=details.num||10;
        for(let i=0;i<d;i++){
            // decide vertical or horizontal
            let vertical=Math.random()>0.5;
                // select random color or details.color
            ctx.fillStyle=details.color?details.color:("#"+Math.random().toString(16).slice(2,8));
            if(vertical){
                // select a random x
                let x=Math.random()*canvas.width;
                // select a random fy ty
                let fy=Math.random()*canvas.height;
                let ty=Math.random()*canvas.height;
                ctx.fillRect(x,fy,1,ty);
            }else{
                // select a random y
                let y=Math.random()*canvas.height;
                // select a random fx tx
                let fx=Math.random()*canvas.width;
                let tx=Math.random()*canvas.width;
                ctx.fillRect(fx,y,tx,1);
            }
        }
    }
}

let txsRunning=[];
let idmax=0;

function txStart(type,details={}){
    if(!txs[type])return;
    // draw type every frame
    let id=idmax++;
    txsRunning[id]={type,details};
    txRun();
    return id;
}

function txRun(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    let runned=false;
    for(let i in txsRunning){
        if(!txsRunning[i])continue;
        txs[txsRunning[i].type](txsRunning[i].details);
        runned=true;
    }
    if(!runned){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        txsRunning=[];
        return;
    }
    requestAnimationFrame(txRun);
}

function txEnd(id){
    if(typeof id=="undefined"){
        txsRunning=[];
    }else{
        txsRunning[id]=false;
    }
}