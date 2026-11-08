/* Author: Shi_Kong233 | JREAST_zairai_lcd_pids v1.4 */
var YM_ATOS_MANIFEST=null,YM_ATOS_LOAD_FAILED=false;
var YM_ATOS_MANIFESTS={},YM_ATOS_FAILURES={};
function ymAtosVoice(){return ymOption('atosVoice')==='female'?'mukaiyama':'tsuda';}
function ymAtosValid(manifest){
    var voice=ymAtosVoice();
    return manifest&&manifest.version===1&&manifest.voice===voice&&manifest.originalPitch===true&&
        (voice==='tsuda'?manifest.maleOnly===true:manifest.femaleOnly===true);
}
function ymAtosPlatform(train){
    var override=ymOption('platform'),label=override==null?'':String(override);
    if(label===''){var raw=train.platformName();label=raw==null?'':String(raw);}
    // Look up the complete literal label in the recording table. Do not trim,
    // parse numbers, split languages, convert width or remove any suffix.
    return label;
}
function ymAtosGrade(train){
    var parts=ymRouteNumber(train.routeNumber()).type.split('|');
    var grades={'Local':'local','Rapid':'rapid','Special Rapid':'special_rapid',
        'Chuo Special Rapid':'chuo_special_rapid','Ome Special Rapid':'ome_special_rapid',
        'Commuter Special Rapid':'commuter_special_rapid','Commuter Rapid':'commuter_rapid',
        'Express':'express','Limited Express':'limited_express'};
    for(var i=0;i<parts.length;i++){
        var label=ymServiceKey(parts[i]);
        if(/^(普通|普通列车|普通列車|ordinary)$/i.test(label))return 'ordinary';
        var known=ymKnownService(label);
        if(known)return grades[known.en]||'train';
    }
    return 'train';
}
function ymAtosLoad(){
    var voice=ymAtosVoice();
    if(ymAtosValid(YM_ATOS_MANIFEST))return YM_ATOS_MANIFEST;
    if(YM_ATOS_MANIFESTS[voice]){YM_ATOS_MANIFEST=YM_ATOS_MANIFESTS[voice];return YM_ATOS_MANIFEST;}
    if(!YM_ATOS_FAILURES[voice]&&typeof Resources!=='undefined'&&typeof Resources.readString==='function'){
        try{
            var path=voice==='tsuda'?'atos_manifest.json':'atos_female_manifest.json';
            var parsed=JSON.parse(String(Resources.readString(Resources.id('yamanote:'+path))));
            if(ymAtosValid(parsed)){YM_ATOS_MANIFESTS[voice]=parsed;YM_ATOS_MANIFEST=parsed;YM_ATOS_LOAD_FAILED=false;}
            else YM_ATOS_FAILURES[voice]=true;
        }catch(e){YM_ATOS_FAILURES[voice]=true;YM_ATOS_LOAD_FAILED=true;}
    }
    return YM_ATOS_MANIFEST;
}
function ymAtosClip(train){
    var fallback={id:'yamanote:atos_approach',durationMs:3356,holdMs:4000};
    ymAtosLoad();var platform=ymAtosPlatform(train);if(!platform)return fallback;
    if(!ymAtosValid(YM_ATOS_MANIFEST)||!YM_ATOS_MANIFEST.clips)return fallback;
    var prefix='yamanote:atos_'+ymAtosVoice()+'/';
    var clip=YM_ATOS_MANIFEST.clips[platform+'/'+ymAtosGrade(train)];
    if(!clip||String(clip.id).indexOf(prefix)!==0||!/^p\d\d_[a-z_]+$/.test(String(clip.id).slice(prefix.length))||
        !(clip.durationMs>3356&&clip.durationMs<60000))return fallback;
    var plan={id:String(clip.id),durationMs:Number(clip.durationMs),holdMs:Number(clip.durationMs)+500};
    var count=ymCarCount(train),tail=YM_ATOS_MANIFEST.carCounts&&YM_ATOS_MANIFEST.carCounts[String(count)];
    if(tail&&String(tail.id)===prefix+'cars_'+('0'+count).slice(-2)&&
        tail.durationMs>500&&tail.durationMs<15000){
        plan.next={id:String(tail.id),durationMs:Number(tail.durationMs)};
        // Include the natural sentence break and native submission allowance.
        plan.holdMs+=plan.next.durationMs+250;
    }
    return plan;
}
function ymAtosEntry(train,now){
    var full=ymAtosClip(train),elapsed=Math.max(0,50000-(Number(train.arrivalTime())-now));
    var total=full.durationMs+(full.next?250+full.next.durationMs:0);
    if(!isFinite(elapsed)||elapsed>=total)return {expired:true,elapsedMs:elapsed,totalDurationMs:total};
    // The first polling/blink interval retains the existing continuous file.
    if(elapsed<1000){full.elapsedMs=elapsed;full.entryOffsetMs=0;full.totalDurationMs=total;full.nextGapMs=250;return full;}
    var resume=YM_ATOS_MANIFEST&&YM_ATOS_MANIFEST.resume;
    if(!resume||resume.version!==1||resume.stepMs!==1000||!resume.sections||!resume.timelines||
        !ymAtosValid(YM_ATOS_MANIFEST))return {expired:true};
    var rows=[],cursor=0,sequence=full.id==='yamanote:atos_approach'?[{section:'chime',gain:1}]:resume.timelines[ymAtosPlatform(train)+'/'+ymAtosGrade(train)];
    if(!sequence||!sequence.length)return {expired:true};
    function row(part,gap){
        var section=resume.sections[part.section];
        if(!section||!(section.durationMs>0)||!Array.isArray(section.clips))return false;
        var gain=part.gain==null?1:Number(part.gain);if(!(gain>0&&gain<=1))return false;
        rows.push({section:section,startMs:cursor,gain:gain,gapMs:gap});cursor+=Number(section.durationMs)+gap;return true;
    }
    for(var i=0;i<sequence.length;i++)if(!row(sequence[i],i+1<sequence.length?150:0))return {expired:true};
    if(full.next){cursor=full.durationMs+250;if(!row({section:'cars_'+('0'+ymCarCount(train)).slice(-2),gain:1},0))return {expired:true};}
    var index=-1;
    for(var j=0;j<rows.length;j++)if(elapsed<rows[j].startMs+rows[j].section.durationMs){index=j;break;}
    if(index<0)return {expired:true};
    var selected=rows[index],within=Math.max(0,elapsed-selected.startMs),offset=null;
    for(var c=0;c<selected.section.clips.length;c++){
        var candidate=selected.section.clips[c];if(Number(candidate.offsetMs)<=within)offset=candidate;
    }
    if(!offset)return {expired:true};
    // Minecraft retains a finished short sound in its active map for up to
    // twenty ticks. Prefer the next natural phrase boundary within our one-
    // second entry resolution instead of adding that gap after a tiny suffix.
    if(offset.durationMs<1000&&index+1<rows.length&&rows[index+1].startMs-elapsed<=1000){
        selected=rows[++index];offset=selected.section.clips[0];
    }
    function clip(item,gain){return {id:String(item.id),durationMs:Number(item.durationMs),gain:gain};}
    var plan=clip(offset,selected.gain),rest=[];
    plan.waitMs=Math.max(0,selected.startMs-elapsed);plan.elapsedMs=elapsed;plan.entryOffsetMs=selected.startMs+Number(offset.offsetMs);plan.totalDurationMs=total;
    for(var n=index+1;n<rows.length;n++){
        var next=clip(rows[n].section.clips[0],rows[n].gain);
        next.gapMs=Math.max(0,rows[n].startMs-rows[n-1].startMs-rows[n-1].section.durationMs);rest.push(next);
    }
    plan.holdMs=plan.waitMs+plan.durationMs+500;
    for(var r=0;r<rest.length;r++)plan.holdMs+=rest[r].gapMs+rest[r].durationMs;
    plan.next=rest.shift()||null;plan.nextGapMs=plan.next?plan.next.gapMs:0;plan.after=rest;
    plan.holdMs=Math.max(4000,plan.holdMs);return plan;
}
