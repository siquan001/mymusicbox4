(()=>{
    window.bilibiliAPI={
        platform:"bilibili",
        name:"siquan",
        support:["img","music","details"],
        requestFz:[["img","music","details"]],
        get:async (dt)=>{
            if(!dt.bvid){
                musicAll.ctErr(0,dt,'bvid');
            }
            let api='https://api.mir6.com/api/bzjiexi';
            let data={
                url:'https://www.bilibili.com/video/'+dt.bvid+'/',
                type:"json"
            }
            let result=await musicAll.ajax(api,data);
            return {
                music:result.data.video_url,
                img:result.imgurl,
                details:{
                    artist:result.name,
                    name:result.title
                }
            }
        }
    }
})()