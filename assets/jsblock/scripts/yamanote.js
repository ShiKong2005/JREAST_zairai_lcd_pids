/* Author: Shi_Kong233 | JREAST_zairai_lcd_pids v1.4 */
/* JR timetable v1.4 by Shi_Kong233: pure layout/data logic, rendered by raster.js. */
var YAMANOTE_DEFAULTS = {
    language: 'cycle', languageSeconds: 8, endAfterMinutes: 120, platformSide: 'left',
    approachSeconds: 50, platform: '', atosVoice: 'male',
    headerDestination: '', rowDestination: '', timeSource: 'departure',
    lineName: '', lineCode: '', lineColor: null, textureWidth: 1024
};
// The reference marquee crosses its central window in approximately 5 seconds.
var YM_NOTICE_STYLE={width:303,inset:22,fade:16,height:22,rowTop:61.4,rowBottom:90,speed:259/5,rounds:2,stepMs:50};
function ymOption(key) {
    return typeof YAMANOTE_OPTIONS !== 'undefined' && YAMANOTE_OPTIONS[key] !== undefined ? YAMANOTE_OPTIONS[key] : YAMANOTE_DEFAULTS[key];
}
function ymString(value) { return value == null ? '' : String(value).trim(); }
function ymLanguagePageMs(){
    var seconds=Number(ymOption('languageSeconds'));
    return (isFinite(seconds)?Math.max(1,seconds):8)*1000;
}
function ymNoticeWaitMs(){return YM_NOTICE_STYLE.rounds*2*ymLanguagePageMs();}
function ymLanguage(now,pids,state) {
    var lang=ymOption('language'),origin=state&&state.noticeCycle&&state.noticeCycle.languageStart||0;
    if(lang==='cycle'&&pids&&pids.englishOnly)return 1;
    return lang === 'en' || (lang === 'cycle' && Math.floor((now-origin)/ymLanguagePageMs()) % 2 === 1) ? 1 : 0;
}
function ymEnglishOnly(pids) {
    var values=[],hasName=false;
    function add(value,name){
        var text=ymString(value).split('||')[0];
        if(text){values.push(text);if(name&&/[A-Za-z\u00C0-\u024F]/.test(text))hasName=true;}
    }
    pids.groups.forEach(function(group){add(group.name,true);group.directions.forEach(function(name){add(name,true);});add(ymRouteNumber(group.number).type,false);});
    pids.trains.slice(0,2).forEach(function(train){add(train.routeName(),true);add(train.destination(),true);add(ymRouteNumber(train.routeNumber()).type,false);});
    ['lineName','headerDestination','rowDestination'].forEach(function(option){add(ymOption(option),true);});
    return hasName&&values.every(function(value){return !/[^\u0020-\u024F\u2000-\u206F]/.test(value);});
}
function ymLocal(value, lang) { var p=ymString(value).split('|'); return p[lang] || p[0] || ''; }
var YM_SERVICE_NAMES = [
    {en:'Local',background:0x333333,aliases:['各駅停車','各站停车','各站停車','各站','各停','普通','普通列车','普通列車','all stops','all stations']},
    {en:'Rapid',background:0xDC3039,aliases:['快速']},
    {en:'Express',background:0xDC3039,aliases:['急行']},
    {en:'Limited Express',background:0xFF2929,aliases:['特急','ltd. exp.']},
    {en:'Special Rapid',background:0x0074BF,aliases:['特快','特别快速','特別快速']},
    {en:'Commuter Rapid',background:0xC000C0,aliases:['通勤快速']},
    {en:'Chuo Special Rapid',background:0x0055BF,aliases:['中央特快','中央特别快速','中央特別快速','chūō special rapid']},
    {en:'Ome Special Rapid',background:0x00C52B,aliases:['青梅特快','青梅特别快速','青梅特別快速','ōme special rapid']},
    {en:'Commuter Special Rapid',background:0xFF0080,aliases:['通勤特快','通勤特别快速','通勤特別快速']}
];
function ymServiceKey(value){return ymString(value).toLowerCase().replace(/\s+/g,'');}
var YM_SERVICE_LOOKUP=Object.create(null);
YM_SERVICE_NAMES.forEach(function(service){
    [service.en].concat(service.aliases).forEach(function(label){YM_SERVICE_LOOKUP[ymServiceKey(label)]=service;});
});
// These grades always use two left-aligned English lines in either layout.
var YM_TWO_LINE_SERVICES = ['Chuo Special Rapid','Ome Special Rapid','Commuter Special Rapid'];
// Only wrap the typed text. Service identity is used for layout, never naming.
function ymServiceLines(value,multiple) {
    var label=value==null?'':String(value);
    if(!/^[\x20-\x7E\u00C0-\u024F]+$/.test(label))return [label];
    var known=ymKnownService(label);
    if(known&&(known.en==='Limited Express'||known.en==='Commuter Rapid'))return [label];
    if(known&&YM_TWO_LINE_SERVICES.indexOf(known.en)>=0){
        // Wrap after the original prefix, including compact/case/accent forms.
        // No characters are replaced and no spaces are inserted into a word.
        var prefixLength=known.en.split(' ')[0].length,letters=0,end=0;
        while(end<label.length&&letters<prefixLength){if(!/\s/.test(label.charAt(end)))letters++;end++;}
        return [label.substring(0,end),label.substring(end).replace(/^\s+/,'')];
    }
    // Unknown multi-route grades use the full single-line font fit, without
    // inheriting the smaller two-line reference or rewriting custom wording.
    if(multiple&&!known)return [label];
    var words=[],pattern=/\S+/g,word;
    while((word=pattern.exec(label)))words.push({text:word[0],start:word.index,end:word.index+word[0].length});
    if(words.length<2)return [label];
    var split=1,best=Infinity;
    if(words.length>2&&words[words.length-2].text.toLowerCase()==='special'&&words[words.length-1].text.toLowerCase()==='rapid')split=words.length-2;
    else for(var i=1;i<words.length;i++){
        var score=Math.max(words[i-1].end,label.length-words[i].start);
        if(score<best){best=score;split=i;}
    }
    return [label.substring(0,words[split-1].end),label.substring(words[split].start)];
}
function ymKnownService(value) {
    return YM_SERVICE_LOOKUP[ymServiceKey(value)]||null;
}
function ymServiceBackground(value) {
    var service=ymKnownService(value);return service?service.background:null;
}
function ymRouteNumber(value) {
    var raw=ymString(value), i=raw.indexOf('||');
    if(i>=0)return {type:raw.substring(0,i).trim(),code:raw.substring(i+2).trim(),explicitCode:true};
    var parts=raw.split('|'),code='',types=[],parsed=false;
    // A complete service label is not a line code, including multi-word English.
    if(parts.some(function(part){return ymServiceBackground(part)!==null;}))
        return {type:raw,code:'',explicitCode:true};
    // Preserve existing bare route-number inputs after these labels become custom.
    // This only protects parsing; their colors, layout, translations and ATOS use the custom path.
    if(parts.some(function(part){return /^(rapid(?:urban|rabbit|acty)|快速(?:アーバン|ラビット|アクティー))$/i.test(part.replace(/\s+/g,''));}))
        return {type:raw,code:'',explicitCode:true};
    for(i=0;i<parts.length;i++){
        var part=parts[i].trim(),m=/^(\S+?)\s*\[([^\]]*)\]$/.exec(part)||/^(\S+)\s+(.+)$/.exec(part);
        if(i===0)code=m?m[1]:part;
        types.push(m&&m[1]===code?m[2].trim():'');
        if(m)parsed=true;
    }
    return parsed?{type:types.join('|'),code:code,explicitCode:true}:{type:'',code:raw,explicitCode:false};
}
function ymCode(train, lang) {
    var n=ymRouteNumber(ymString(ymOption('lineCode')) || (train ? train.routeNumber() : ''));
    return (n.explicitCode ? n.code : ymLocal(n.code,lang)) || '';
}
function ymDestination(value, lang) {
    var raw=ymString(value), i=raw.indexOf('||');
    return {text:ymLocal(i<0 ? raw : raw.substring(0,i),lang) || (lang ? 'No destination' : '行先情報なし'), code:i<0 ? '' : raw.substring(i+2).trim()};
}
function ymDestinationCode(raw, routeCode) {
    // Consume whole tokens, never a substring (K must not match NK01).
    // Concatenated tokens have alphabetic route prefixes and numeric stop IDs.
    var rest=ymString(raw),code=ymString(routeCode),selected='',m;
    if(!/^[A-Za-z]+$/.test(code))return '';
    while(rest.length){
        m=/^([A-Za-z]+)([0-9]+)(?:[\s,;/|]+|$)?/.exec(rest);
        if(!m)return '';
        if(m[1]===code&&!selected)selected=m[1]+m[2];
        rest=rest.substring(m[0].length);
    }
    return selected;
}
function ymDestinationBadgeCode(train,destination,lang) {
    var code=ymCode(train,lang),direct=ymDestinationCode(destination.code,code);
    if(direct||ymString(ymOption('rowDestination')))return direct;
    // An explicitly malformed suffix still hides the badge; do not silently repair it.
    if(destination.code&&!/^(?:[A-Za-z]+[0-9]+(?:[\s,;/|]+|$)?)+$/.test(destination.code))return '';
    var station=ymDestination(train._destinationStationName||'',lang);
    return ymDestinationCode(station.code,code);
}
function ymReadFacing(pids) {
    if(typeof pids.blockPos!=='function'||typeof Packages==='undefined')return '';
    try {
        var world=Packages.org.mtr.mapping.holder.MinecraftClient.getInstance().getWorldMapped();
        if(!world)return '';
        var block=world.getBlockState(pids.blockPos().toBlockPos());
        return String(Packages.org.mtr.mod.block.IBlock.getStatePropertySafe(block,
            Packages.org.mtr.mapping.mapper.DirectionHelper.FACING).asString());
    }catch(e){return '';}
}
function ymPlatformSide(facing) {
    var right=ymOption('platformSide')==='right';
    // JCM: rotateY(90-facing.asRotation()), then rotateZ(180).
    // Increasing screen X points along block FACING, not the viewer direction.
    if(facing==='north'||facing==='west')right=!right;
    return right?'right':'left';
}
function ymTime(timestamp) {
    var d=new Date(Number(timestamp)); if(!isFinite(d.getTime())) return '--:--';
    function two(n){return n<10?'0'+n:String(n);}
    return two(d.getHours())+':'+two(d.getMinutes());
}
function ymRouteName(train,lang) { return ymLocal(ymString(ymOption('lineName')) || (train?train.routeName():''),lang) || (lang?'Train information':'列車案内'); }
function ymRouteColor(train) { var c=ymOption('lineColor');return c!=null?Number(c):(train?Number(train.routeColor()):0x70C4DB); }
function ymService(train,lang) {
    var n=ymRouteNumber(train.routeNumber()), parts=n.type.toLowerCase().split('|'),label=ymLocal(n.type,lang);
    // Each language shows the supplied text. A missing language reuses the
    // other original label; recognition only controls colors and ATOS.
    if(!ymString(label))return {label:'',background:0x252A32,missing:true};
    for(var i=0;i<parts.length;i++) {
        var service=ymKnownService(parts[i]);
        if(service)return {label:label,background:service.background};
    }
    // Matching chooses a background only; the supplied label is never renamed.
    return {label:label,background:0x252A32,missing:!ymString(label)};
}
function ymDestinationIsHere(destination,platform,pids) {
    var name=ymLineIdentity(String(destination||'').split('||')[0]);
    var station=pids.stationNames&&pids.stationNames[platform];
    station=station||pids.stationName||'';
    return !!name&&name===ymLineIdentity(String(station).split('||')[0]);
}
function ymTerminatesHere(train,pids) {
    return !!train&&ymDestinationIsHere(train.destination(),ymExactId(train,'platformId'),pids);
}
function ymTripMatch(train) {
    if(!train || typeof train.routeId!=='function' || typeof train.platformId!=='function' || typeof train.departureIndex!=='function')return '';
    return ymExactId(train,'routeId')+'/'+ymExactId(train,'platformId')+'/'+ymExactId(train,'departureIndex');
}
function ymTripKey(train) {
    if(train&&train._tripKey)return train._tripKey;
    var match=ymTripMatch(train);if(!match)return '';
    // departureIndex is reused. Identify the particular scheduled stop, removing
    // realtime deviation. ymSameTripKey also tolerates subsecond clock jitter.
    var response=train.arrivalResponse;
    var scheduled=response?Number(response.getArrival())-Number(response.getDeviation()):Number(train.arrivalTime())-(typeof train.deviation==='function'?Number(train.deviation()):0);
    return match+'/'+scheduled;
}
function ymSameTripKey(a,b) {
    a=ymString(a);b=ymString(b);if(a===b)return !!a;
    var ai=a.lastIndexOf('/'),bi=b.lastIndexOf('/');
    if(ai<=0||bi<=0||a.substring(0,ai)!==b.substring(0,bi))return false;
    var at=a.substring(ai+1),bt=b.substring(bi+1);
    if(!/^-?\d+(?:\.\d+)?$/.test(at)||!/^-?\d+(?:\.\d+)?$/.test(bt))return false;
    // Actual live claims differed by 2 ms for the same scheduled stop. Compare
    // nearby timestamps directly so crossing a rounded-second boundary is safe.
    // A later cycle reusing departureIndex still has a separate scheduled time.
    return Math.abs(Number(at)-Number(bt))<=1000;
}
function ymVehicleStates(data) {
    var result=[];
    if(typeof MTRClientData==='undefined')return result;
    try {
        data=data||MTRClientData.getInstance();if(!data || !data.vehicles)return result;
        var vehicles=data.vehicles.iterator();
        while(vehicles.hasNext()){
          try {
            var vehicle=vehicles.next(),extra=vehicle.vehicleExtraData,persistent=vehicle.persistentVehicleData;
            if(!extra || !persistent)continue;
            result.push({id:ymExactId(vehicle,'getId'),trip:ymExactId(extra,'getThisRouteId')+'/'+ymExactId(extra,'getThisPlatformId')+'/'+ymExactId(vehicle,'getDepartureIndex'),
                route:ymExactId(extra,'getThisRouteId'),platform:ymExactId(extra,'getThisPlatformId'),
                moving:!!vehicle.isMoving(),open:Number(persistent.getDoorValue())>0 || Number(persistent.getAdjustedDoorMultiplier(extra))>0});
          }catch(e){/* Ignore a vehicle whose data is not available. */}
        }
    }catch(e){/* No live evidence: use the timetable for approach timing. */}
    return result;
}
function ymStopObservations(entries,now,state,vehicles) {
    // Door observations only suppress the first service's approach notice.
    // They must never replace clocks or hide/extend timetable rows.
    vehicles=vehicles||ymVehicleStates();
    var owners={},records={},old=state.stopObservations||{},oldOwners=state.stopOwners||{};
    for(var v=0;v<vehicles.length;v++){
        var live=vehicles[v];
        var owner=oldOwners[live.id];
        // Preserve ownership even if the upstream list removes the current row
        // early. The old vehicle must not suppress the following service's notice.
        if(owner&&!live.moving&&owner.trip===live.trip)owners[live.id]=owner;
    }
    var train=entries==null?null:entries.get(0),key=ymTripKey(train);
    if(key){
        var trip=ymTripMatch(train),record=old[key];
        if(!record){
            var previousKeys=Object.keys(old);
            for(var k=0;k<previousKeys.length;k++)if(ymSameTripKey(previousKeys[k],key)){record=old[previousKeys[k]];break;}
        }
        if(!record&&Math.abs(Number(train.arrivalTime())-now)<=120000&&Number(train.departureTime())>now){
            for(v=0;v<vehicles.length;v++){
                live=vehicles[v];owner=owners[live.id];
                if(live.trip!==trip||live.moving||!live.open||(owner&&!ymSameTripKey(owner.key,key)))continue;
                record={vehicle:live.id};owners[live.id]={trip:trip,key:key};break;
            }
        }
        if(record)records[key]=record;
    }
    state.stopObservations=records;state.stopOwners=owners;return records;
}
function ymStatus(train,now,stopObservations) {
    if(!train) return 'ended';
    var a=Number(train.arrivalTime()),d=Number(train.departureTime());
    if(!isFinite(a)||!isFinite(d)) return 'unavailable';
    var record=stopObservations&&stopObservations[ymTripKey(train)];
    if(d<=now) return 'departed';
    if(a-now>ymOption('endAfterMinutes')*60000) return 'ended';
    if(record||a-now<=5000) return 'normal';
    return a-now<=ymOption('approachSeconds')*1000?'approaching':'normal';
}
function ymNoticeHex(value) {
    var hex=value.substring(1);
    if(hex.length===3)hex=hex.replace(/./g,function(c){return c+c;});
    return parseInt(hex,16);
}
function ymParseNotice(raw) {
    var match=/^@notice\s+(?:(#[0-9a-f]{6}|#[0-9a-f]{3})\s+)?([\s\S]+)$/i.exec(ymString(raw));
    if(!match)return null;
    var content=match[2].trim();
    // An invalid leading colour is a malformed command, kept as ordinary text.
    if(!content||(!match[1]&&content.charAt(0)==='#'))return null;
    var color=match[1]?ymNoticeHex(match[1]):0xFFFF00,segments=[],last=0;
    var token=/\{(#[0-9a-f]{6}|#[0-9a-f]{3})\}/gi,p;
    while((p=token.exec(content))!==null){
        if(p.index>last)segments.push({text:content.substring(last,p.index),color:color});
        color=ymNoticeHex(p[1]);last=token.lastIndex;
    }
    if(last<content.length)segments.push({text:content.substring(last),color:color});
    if(!segments.length)return null;
    return {segments:segments};
}
function ymApproachActive(pids,now) {
    var first=pids.trains[0];
    return ymStatus(first,now,pids.stopObservations)==='approaching'&&!ymTerminatesHere(first,pids)&&
        !pids.isRowHidden(0)&&!pids.isRowHidden(1)&&!ymString(pids.getCustomMessage(0))&&!ymString(pids.getCustomMessage(1));
}
function ymNoticeWidth(message,state) {
    if(typeof ymNoticeLayout==='function'&&typeof YM_FONT!=='undefined'&&YM_FONT&&state.texture&&state.fonts)
        return ymNoticeLayout(state.texture.graphics,message.segments,YM_NOTICE_STYLE.height*90/81,YM_FONT,state.fonts).width;
    // Pure-layout callers do not have Java fonts; runtime uses measured glyphs.
    var text=message.segments.map(function(s){return s.text;}).join(''),width=0;
    for(var i=0;i<text.length;i++){
        var cp=text.charCodeAt(i);if(cp>=0xD800&&cp<=0xDBFF&&i+1<text.length)i++;
        width+=cp>255?22:14;
    }
    return width;
}
function ymDisplayPhase(pids,now,state) {
    var approach=ymApproachActive(pids,now),messages=pids.noticeMessages||[],first=pids.trains[0];
    var key=pids.noticeKey===undefined?JSON.stringify(messages):pids.noticeKey,cycle=state.noticeCycle;
    var tripKey=ymTripKey(first),policy=ymOption('language')+'/'+ymLanguagePageMs();
    if(!messages.length){state.noticeCycle=null;return {approach:approach,announcement:null};}
    if(!cycle||cycle.key!==key||now<cycle.lastNow){
        cycle={key:key,tripKey:tripKey,policy:policy,phase:'trains',since:now,languageStart:now,index:0,lastNow:now};state.noticeCycle=cycle;
    }
    if((cycle.tripKey!==tripKey&&!ymSameTripKey(cycle.tripKey,tripKey))||cycle.policy!==policy){
        // A new first service gets two complete normal language rounds. Keep
        // the notice queue position, including an interrupted unfinished line.
        if(cycle.phase==='notice'&&now-cycle.since>=cycle.duration)cycle.index=(cycle.index+1)%messages.length;
        cycle.phase='trains';cycle.since=now;cycle.languageStart=now;cycle.preempted=false;
    }
    cycle.tripKey=tripKey;cycle.policy=policy;
    cycle.lastNow=now;
    var status=ymStatus(first,now,pids.stopObservations);
    if(approach||pids.isRowHidden(1)||ymString(pids.getCustomMessage(1))||status==='ended'||status==='unavailable'||status==='departed'){
        // Preemption ends this pass. After the higher-priority display clears,
        // start two fresh normal language rounds, never resume halfway.
        cycle.phase='trains';cycle.since=now;cycle.preempted=true;return {approach:approach,announcement:null};
    }
    if(cycle.preempted){cycle.preempted=false;cycle.phase='trains';cycle.since=now;cycle.languageStart=now;}
    var wait=ymNoticeWaitMs();
    if(cycle.phase==='trains'&&now-cycle.since>=wait){
        cycle.phase='notice';cycle.since=now;cycle.width=ymNoticeWidth(messages[cycle.index],state);
        cycle.duration=Math.ceil(((YM_NOTICE_STYLE.width-2*YM_NOTICE_STYLE.inset)*316/303+cycle.width)/(YM_NOTICE_STYLE.speed*316/303)*1000)+500;
    }
    if(cycle.phase==='notice'&&now-cycle.since>=cycle.duration){
        cycle.phase='trains';cycle.since=now;cycle.languageStart=now;cycle.index=(cycle.index+1)%messages.length;
    }
    return {approach:approach,announcement:cycle.phase==='notice'?{
        segments:messages[cycle.index].segments,travel:Math.floor((now-cycle.since)/YM_NOTICE_STYLE.stepMs)*YM_NOTICE_STYLE.stepMs/1000*YM_NOTICE_STYLE.speed
    }:null};
}
function ymScheduledDisplayPhase(snap,now,state){
    var policy=ymOption('approachSeconds')+'/'+ymOption('endAfterMinutes')+'/'+ymOption('language')+'/'+ymLanguagePageMs(),rollback=state.displayLastNow!=null&&now<state.displayLastNow;
    if(rollback)state.noticeCycle=null;
    if(!rollback&&state.displaySnapshot===snap&&state.displayPolicy===policy&&now<state.displayDue){
        state.displayLastNow=now;return state.displayResult;
    }
    var result=ymDisplayPhase(snap,now,state),due=Infinity,first=snap.trains[0],cycle=state.noticeCycle;
    function boundary(time){if(isFinite(time)&&time>now&&time<due)due=time;}
    if(first){
        var arrival=Number(first.arrivalTime());
        boundary(arrival-ymOption('approachSeconds')*1000);boundary(arrival-5000);
        boundary(arrival-ymOption('endAfterMinutes')*60000);boundary(Number(first.departureTime()));
    }
    if(cycle&&!cycle.preempted){
        if(cycle.phase==='trains')boundary(cycle.since+ymNoticeWaitMs());
        else{
            boundary(cycle.since+(Math.floor((now-cycle.since)/YM_NOTICE_STYLE.stepMs)+1)*YM_NOTICE_STYLE.stepMs);
            boundary(cycle.since+cycle.duration);
        }
    }
    state.displaySnapshot=snap;state.displayPolicy=policy;state.displayDue=due;state.displayResult=result;state.displayLastNow=now;
    return result;
}
// Reference simulator's 4000 x 1000 content grid, fitted to the existing screen.
// The casing, platform-number region and texture UVs retain their geometry.
var YM_LCD_LAYOUT={width:4000,height:1000,panelWidth:318,panelHeight:96,
    headerBottom:315,rowTop:[330,675],rowHeight:330,gradeLeft:100,gradeWidth:625,
    clockLeft:1365,clockWidth:880,destinationLeft:2340,destinationCodeLeft:2340,
    destinationAfterCode:2580,destinationRight:3380,carsRight:3700,carsUnitLeft:3720};
function ymDestinationWidth(cars,code){
    return ((cars?YM_LCD_LAYOUT.destinationRight:3900)-
        (code?YM_LCD_LAYOUT.destinationAfterCode:YM_LCD_LAYOUT.destinationLeft))*YM_LCD_LAYOUT.panelWidth/YM_LCD_LAYOUT.width;
}
function ymPairDestinations(scene,pids,now,lang,widthResolver){
    var labels=scene.filter(function(command){return !!command.destinationField;});
    if(labels.length===2){
        labels[0].destinationPeer=labels[1].text;labels[0].destinationPeerWidth=labels[1].w;
        labels[1].destinationPeer=labels[0].text;labels[1].destinationPeerWidth=labels[0].w;
    }else if(labels.length===1){
        // A temporary notice/approach overlay must not resize the first row.
        var other=1-labels[0].destinationRow,train=pids.arrivals().get(other);
        if(train&&!pids.isRowHidden(other)&&!ymLocal(pids.getCustomMessage(other),lang)&&!ymTerminatesHere(train,pids)){
            var status=ymStatus(train,now,other===0?pids.stopObservations:null);
            if(status!=='departed'&&status!=='ended'&&status!=='unavailable'){
                var destination=ymDestination(ymString(ymOption('rowDestination'))||train.destination(),lang);
                var code=ymDestinationBadgeCode(train,destination,lang),cars=pids.mixedComposition?ymCarCount(train):0;
                labels[0].destinationPeer=destination.text;labels[0].destinationPeerWidth=widthResolver?widthResolver(cars,code):ymDestinationWidth(cars,code);
                labels[0].destinationHeld=true;
            }
        }
    }
    return scene;
}
// A single-route header keeps distinct name/direction columns and a clear gap.
function ymSingleHeader(header,panelLeft){
    var list=[],sx=318/4000,sy=96/1000;
    function rect(x,y,w,h,color,radius){list.push({kind:'rect',x:panelLeft+2+x*sx,y:2+y*sy,w:w*sx,h:h*sy,color:color,radius:radius});}
    function text(value,x,y,w,h,color,align,role){
        var c={kind:'text',text:value,x:panelLeft+2+x*sx,y:2+y*sy,w:w*sx,h:h*sy,color:color,align:align||'left',bold:true,role:role||'label'};
        list.push(c);return c;
    }
    var nameX=header.code?410:100,nameWidth=header.code?850:1160;
    if(header.code){
        rect(100,35,245,245,header.color,1.3);rect(120,55,205,205,0xFFFFFF,.4);
        var codeParts=/^([A-Za-z]+)[ -]?(\d{1,3})$/.exec(header.code);
        if(codeParts){text(codeParts[1],222.5,53,190,78.4,0x111B27,'center','badge');text(codeParts[2],222.5,140.35,200,117.6,0x111B27,'center','badge');}
        else text(header.code,222.5,74.2,190,164.15,0x111B27,'center','badge');
    }
    var name=header.name,qualifier=/^(.+?)[（(]([^）)]+)[）)]$/.exec(name);
    if(!qualifier&&/^[\x20-\x7e]+$/.test(name)&&name.length>16&&/ Line$/.test(name))qualifier=[name,name.slice(0,-5),'Line'];
    var first=text(qualifier?qualifier[1]:name,nameX,qualifier?32:88,nameWidth,qualifier?110:150,0xFFFFFF);first.headerName=true;
    if(qualifier){
        var second=text(qualifier[2]==='Line'?'Line':'('+qualifier[2]+')',nameX,162,nameWidth,110,0xFFFFFF);second.headerName=true;
        first.headerPeer=second.text;first.headerPeerWidth=second.w;second.headerPeer=first.text;second.headerPeerWidth=first.w;
    }
    // The fields have a 190/4000-width gap: 60px at a 1600px texture.
    var direction=text(header.direction,1450,70,2450,190,0xFFFFFF);direction.headerDirection=true;
    return list;
}
function ymBuildScene(pids,now,state,display) {
function ymInsetInformation(scene){
    // Keep the black panel and number column fixed; pad its visible contents.
    var left=scene[1].x,sx=318/322,sy=.96;
    scene.forEach(function(command,index){
        if(index<2||command.role==='platform')return;
        command.x=left+2+(command.x-left)*sx;
        command.y=2+command.y*sy;
        command.w*=sx;command.h*=sy;
        if(command.headerPeerWidth!==undefined)command.headerPeerWidth*=sx;
        if(command.destinationPeerWidth!==undefined)command.destinationPeerWidth*=sx;
        // Notice lettering and travel use the same horizontal scale so a
        // complete pass and the existing announcement timing remain aligned.
        if(command.kind==='marquee'){command.textHeight*=sx;command.travel*=sx;}
    });
    return scene;
}
function ymExpandTimetable(scene){
    // Keep the header fixed and map the two timetable rows to the bottom edge.
    var top=5+22*90/81,scale=(100-top)/(5+80*90/81-top);
    scene.forEach(function(command){
        if(command.role==='platform'||command.y<top)return;
        command.y=top+(command.y-top)*scale;
        command.h=command.kind==='marquee'?100-command.y:command.h*scale;
    });
    ymInsetInformation(scene);
    scene[1].routeCount=groups.length;
    scene[2].role='header-background';scene[3].role='header-rule';scene[4].role='row-rule';
    scene[2].x=scene[1].x+2;scene[2].y=2;scene[2].w=318;scene[2].h=scene[3].y-2;scene[2].color=0x111111;
    scene[3].color=0x4B4B4B;scene[4].color=0x4B4B4B;
    scene.forEach(function(c){
        if(c.kind==='rect'&&c.radius===.9&&c.w>75)c.role='service-background';
        if(c.role==='service')c.serviceMultiple=multiple;
    });
    if(singleHeader){var commands=ymSingleHeader(singleHeader,scene[1].x);scene.splice.apply(scene,[headerAt,0].concat(commands));}
    return scene;
}

    state=state||{};
    // Direct callers may request one fresh snapshot; render supplies the cached one.
    if(!pids.trains)pids=ymPoll(pids,now,state);
    display=display||ymDisplayPhase(pids,now,state);
    var scene=[],rapidBadges=[],lang=ymLanguage(now,pids,state),right=ymPlatformSide(pids.facing)==='right',panelLeft=right?0:78;
    // Swap panel/number positions while preserving reading order within the panel.
    function rect(x,y,w,h,color,radius){
        if(x!==0||y!==0){x=panelLeft+(x-92)*322/298;y=5+(y-10)*90/81;w=w*322/298;h*=90/81;}
        scene.push({kind:'rect',x:x,y:y,w:w,h:h,color:color,radius:radius||0});
    }
    function text(value,x,y,w,h,color,align,bold,role){
        if(role==='platform'){x=right?361:39;w=58;}
        else{x=panelLeft+(x-92)*322/298;y=5+(y-10)*90/81;w=w*322/298;h*=90/81;}
        var command={kind:'text',text:String(value),x:x,y:y,w:w,h:h,color:color,align:align||'left',bold:!!bold,role:role||'label'};
        // Grow the information lettering around its current vertical center.
        // Badge/platform bounds and paired service-label fits have their own limits.
        if(role!=='platform'&&role!=='badge'&&role!=='service'){command.y-=command.h*.09;command.h*=1.18;}
        scene.push(command);
    }
    function serviceLabel(value,x,y,w,h,color,pillWidth,pillHeight,pillTop){
        var lines=ymServiceLines(value,multiple);
        if(lines.length===1){
            text(lines[0],x,y,w,h,color,'center',true,'service');
            if(pillHeight>=20){var single=scene[scene.length-1];single.y-=single.h*.09;single.h*=1.18;}
            else scene[scene.length-1].serviceFill=true;
            return;
        }
        // Remaining paired labels retain their reference geometry. Special
        // Rapid grows as one centered line inside the same badge.
        var known=ymKnownService(value);
        var growSingle=multiple&&known&&known.en==='Special Rapid';
        var background=scene[scene.length-1],padX=background.w*.025,padY=background.h*.075;
        var gap=background.h*.05,lineHeight=(background.h-2*padY-gap)/2;
        for(var line=0;line<2;line++)scene.push({kind:'text',text:lines[line],
            x:background.x+padX,y:background.y+padY+line*(lineHeight+gap),
            w:background.w-2*padX,h:lineHeight,color:color,align:'left',bold:true,role:'service',
            servicePeer:lines[1-line],serviceStack:true,serviceJoined:String(value),
            serviceLine:line,serviceGapRatio:gap/lineHeight,serviceKeepStack:!!(known&&YM_TWO_LINE_SERVICES.indexOf(known.en)>=0),serviceGrowSingle:!!growSingle,
            serviceForceSingle:!!(known&&known.en==='Special Rapid')});
    }
    function badge(code,x,y,size,color){
        rect(x,y,size,size,color,1.3);rect(x+1.4,y+1.4,size-2.8,size-2.8,0xFFFFFF,0.4);
        // Explicit destination codes like JK06 use the station badge's two-line layout.
        var m=/^([A-Za-z]+)[ -]?(\d{1,3})$/.exec(code);
        if(m){text(m[1],x+size/2,y+1.6,size-4,size*.32,0x111B27,'center',true,'badge');text(m[2],x+size/2,y+size*.43,size-3,size*.48,0x111B27,'center',true,'badge');}
        else text(code,x+size/2,y+size*.16,size-4,size*.67,0x111B27,'center',true,'badge');
    }
    function headerPair(name,x1,y1,w1,destination,x2,y2,w2,height){
        text(name,x1,y1,w1,height,0xFFFFFF,'left',true);
        var firstLabel=scene[scene.length-1];
        text(destination,x2,y2,w2,height,0xFFFFFF,'left',true);
        var secondLabel=scene[scene.length-1];
        firstLabel.headerName=true;secondLabel.headerDirection=true;
        firstLabel.headerPeer=secondLabel.text;firstLabel.headerPeerWidth=secondLabel.w;
        secondLabel.headerPeer=firstLabel.text;secondLabel.headerPeerWidth=firstLabel.w;
    }
    // Keep gray only behind the platform number. The information panel fills
    // the remaining face with black, including its top/bottom and outer edge.
    rect(0,0,400,100,0x333333);
    scene.push({kind:'rect',x:right?0:78,y:0,w:322,h:100,color:0,radius:0,role:'panel-background'});
    rect(92,10,298,21,0);
    rect(92,32,298,.4,0xA9C1CF);rect(92,61,298,.4,0xA9C1CF);
    var entries=pids.arrivals(),first=entries==null?null:entries.get(0);
    var stopObservations=pids.stopObservations;
    var platform=ymString(ymOption('platform')) || ymString(pids.platformName);
    if(!pids.isPlatformNumberHidden())text(ymLocal(platform,lang)||'—',41,13,66,72,0xFFFFFF,'center',false,'platform');
    var groups=pids.groups.slice(0,2),multiple=groups.length>1,headerAt=scene.length,singleHeader=null;
    var twoRoutes=groups.length===2,bottomGrade=null,alignedRows=[];
    function groupTrain(group){return {routeNumber:function(){return group.number;},routeName:function(){return group.name;},routeColor:function(){return group.color;}};}
    function direction(group){
        var destination=group.destination||(group.directions.length?group.directions[group.directions.length-1]:'');
        if(ymDestinationIsHere(destination,group.platform,pids))return '';
        var override=ymString(ymOption('headerDestination'));
        return override?ymDirectionText([override],lang):ymDirectionText(group.directions,lang);
    }
    if(multiple){
        var columnWidth=300/groups.length;
        for(var h=0;h<groups.length;h++){
            var group=groups[h],headerTrain=groupTrain(group),left=92+h*columnWidth;
            var headerCode=ymCode(headerTrain,lang),inset=headerCode?20:0;
            if(headerCode)badge(headerCode,left,12.5,16.5,ymRouteColor(headerTrain));
            headerPair(ymRouteName(headerTrain,lang),left+inset,11.25,columnWidth-inset-4,
                direction(group),left+inset,21,columnWidth-inset-4,8.3);
        }
    }else{
        var only=groups.length?groups[0]:null,headerTrain=only?groupTrain(only):first;
        singleHeader={name:ymRouteName(headerTrain,lang),code:ymCode(headerTrain,lang),
            color:ymRouteColor(headerTrain),direction:only?direction(only):(lang?'Departure information':'列車案内')};
    }
    var status=ymStatus(first,now,stopObservations),hasCustom=ymString(pids.getCustomMessage(0))||ymString(pids.getCustomMessage(1));
    var notice=display.approach;
    if((status==='ended'||status==='unavailable')&&!hasCustom){
        text(status==='ended'?(lang?'Service has ended for today':'☆本日の運転は終了しました☆'):(lang?'Information unavailable':'列車情報を取得できません'),240,44,283,16,0xFFFFFF,'center');
        return ymExpandTimetable(scene);
    }
    for(var i=0;i<2;i++) {
        var y=36+i*29;
        if(i===1&&notice){
            if(Math.floor(now/500)%2===0)text(lang?'Train approaching':'電車がまいります',240,66,277,22,0xFFEA24,'center',true,'approach');
            continue;
        }
        if(i===1&&display.announcement){
            var announcement=display.announcement;
            var noticeTop=5+(YM_NOTICE_STYLE.rowTop-10)*90/81;
            scene.push({kind:'marquee',x:right?0:78,y:noticeTop,
                w:322,h:100-noticeTop,
                textHeight:YM_NOTICE_STYLE.height*90/81,color:0xFFFF00,segments:announcement.segments,
                travel:announcement.travel*316/303,role:'notice-scroll'});
            continue;
        }
        var custom=ymLocal(pids.getCustomMessage(i),lang);
        if(custom){text(custom,94,y+2,290,17,0xFFFFFF);continue;}
        if(pids.isRowHidden(i))continue;
        var train=entries==null?null:entries.get(i);if(!train)continue;
        var rowStatus=i===0?status:ymStatus(train,now,null);if(rowStatus==='departed'||rowStatus==='ended')continue;
        if(rowStatus==='unavailable'){text(lang?'Information unavailable':'列車情報を取得できません',94,y+2,290,16,0xAEB8C5);continue;}
        if(ymTerminatesHere(train,pids)){
            text(lang?'Not in service':'当駅止まり',94,y+1,190,20,0xFF0000,'left',true,'terminus');continue;
        }
        var service=ymService(train,lang);
        var rowStart=scene.length,destinationBadge=null;
        var serviceText=service.missing?(pids.englishOnly&&lang?(i===0?'First':'Next'):(i===0?'先発':'次発')):service.label,serviceColor=service.missing?0xFFFF00:0xFFFFFF;
        if(multiple&&service.missing){
            // No grade: use the full service area for a larger line name.
            text(ymRouteName(train,lang),92,y+3,79,15.5,ymRouteColor(train),'left',true);
        }else if(multiple){
            // Use the whole service column for both the route and its grade.
            text(ymRouteName(train,lang),131.5,y-2,78,11.5,ymRouteColor(train),'center',true,'route');
            if(!service.missing)rect(92,y+10.5,79,14.5,service.background,.9);
            var serviceBackground=scene[scene.length-1];
            serviceLabel(serviceText,131.5,y+10.75,77,14,serviceColor,79,14.5,y+10.5);
            serviceBackground.y+=.25*90/81;
            if(twoRoutes){
                // Keep the text reference and align both badges with the column.
                serviceBackground.h-=.25*90/81;
                if(i===1)bottomGrade=serviceBackground;
            }else{
                serviceBackground.x+=.75*322/298;serviceBackground.w-=1.5*322/298;
                serviceBackground.h-=.5*90/81;
            }
        }else{
            var badgeStart=scene.length;
            if(!service.missing)rect(93,y-1.5,77,25,service.background,.9);
            serviceLabel(serviceText,131.5,y+3,71,15.5,serviceColor,79,20,y+1);
            var rapid=state.equalRapidGaps&&ymKnownService(ymRouteNumber(train.routeNumber()).type.split('|')[0]);
            if(!service.missing&&rapid&&rapid.en==='Rapid'&&scene.length===badgeStart+2)
                rapidBadges.push([scene[badgeStart],scene[badgeStart+1]]);
        }
        // Reserve 8.5 logical units on each side of the clock column.
        text(ymTime(ymOption('timeSource')==='departure'?train.departureTime():train.arrivalTime()),214,y-1.5,69,24,0xFFFFFF,'center',false,'clock');
        var destination=ymDestination(ymString(ymOption('rowDestination'))||train.destination(),lang);
        var destinationCode=ymDestinationBadgeCode(train,destination,lang);
        if(destinationCode){
            var badgeStart=scene.length;
            badge(destinationCode,257,y+2.5,17,ymRouteColor(train));
            destinationBadge=scene.slice(badgeStart);
        }
        var cars=pids.mixedComposition?ymCarCount(train):0;
        text(destination.text,destinationCode?279:257,y+1,(cars?62:106)+(destinationCode?0:22),20,0xFFFFFF);
        scene[scene.length-1].destinationField=true;
        scene[scene.length-1].destinationRow=i;
        if(cars){
            text(cars,370,y+2.5,25,17,0xFFFF80,'right',false,'car-count');
            text(lang?'Cars':'両',373,y+(lang?11.6:6.975),16,lang?6.8:11.05,0xFFFF80,'left',false,'car-unit');
        }
        if(twoRoutes&&!service.missing)alignedRows.push({index:i,commands:scene.slice(rowStart),badge:destinationBadge});
    }
    ymExpandTimetable(ymPairDestinations(scene,pids,now,lang,function(cars,code){return ((cars?62:106)+(code?0:22))*322/298;}));
    if(bottomGrade)bottomGrade.h=100-bottomGrade.y;
    alignedRows.forEach(function(row){
        var upper=row.index===0?scene[3]:scene[4];
        // The grade, clock, destination and count share one visible lower edge.
        // Keep the full-height grade inside its badge and the lower shell gap.
        var top=upper.y+upper.h,bottom=row.index===0?scene[4].y-.5:98;
        row.commands.forEach(function(command){
            if(command.role==='service'||command.role==='clock'||command.destinationField||
                command.role==='car-count'||command.role==='car-unit'){
                command.inkTop=top;command.inkBottom=bottom;
            }
        });
        if(row.badge){
            var frame=row.badge[0],offset=bottom-frame.y-frame.h;
            row.badge.forEach(function(command){command.y+=offset;});
        }
    });
    if(rapidBadges.length===2){
        // Distribute the three empty bands around two ordinary Rapid badges.
        var upper=scene[3].y+scene[3].h,divider=scene[4];
        var gap=(100-upper-rapidBadges[0][0].h-rapidBadges[1][0].h)/3;
        var top=upper+gap;
        rapidBadges.forEach(function(pair){
            var offset=top-pair[0].y;
            pair[0].y=top;pair[1].y+=offset;
            top+=pair[0].h+gap;
        });
        divider.y=rapidBadges[0][0].y+rapidBadges[0][0].h+(gap-divider.h)/2;
    }
    return scene;
}
function create(ctx,state,pids){ymCreateRaster(state);}
var YM_APPROACH_CLAIMS=[],YM_APPROACH_SPEAKERS=[],YM_APPROACH_PLAYBACKS=[],YM_APPROACH_RUNNER=null,YM_SPEAKER_READ=null;
function ymAudioNativeStore(){return typeof Files!=='undefined'&&typeof Packages!=='undefined';}
function ymAudioWorld(){return ymAudioNativeStore()?String(MTRClientData.getInstance().hashCode()):'offline';}
function ymAudioTransaction(action){
    if(!ymAudioNativeStore())return action();
    var transaction=new Packages.com.lx862.mtrscripting.lib.org.mozilla.javascript.Synchronizer(action,Packages.java.util.Locale.ROOT);
    return transaction();
}
function ymAudioCoordinates(vector){
    if(!vector)return null;
    var axes=['x','y','z'],values=[];
    for(var i=0;i<3;i++){
        var v=typeof vector[axes[i]]==='function'?Number(vector[axes[i]]()):Number(vector[i]);
        if(!isFinite(v))return null;values.push(v);
    }
    return values;
}
function ymSpeakerList(world,now){
    var entries=YM_APPROACH_SPEAKERS;
    if(ymAudioNativeStore()){
        var raw=Files.hasData('jre_zairai_lcd_pids','approach-speakers.json')?
            String(Files.readData('jre_zairai_lcd_pids','approach-speakers.json').asString()):'[]';
        try{entries=JSON.parse(raw);}catch(e){entries=[];}
    }
    if(!Array.isArray(entries))entries=[];
    return entries.filter(function(e){return e&&e.world===world&&e.token&&Array.isArray(e.platforms)&&
        Array.isArray(e.pos)&&e.pos.length===3&&e.pos.every(function(v){return typeof v==='number'&&isFinite(v);})&&
        isFinite(e.at)&&now>=e.at&&now-e.at<90000;});
}
function ymSaveSpeakers(entries){
    entries=entries.slice(-512);
    YM_SPEAKER_READ=null;
    if(ymAudioNativeStore())Files.saveData(JSON.stringify(entries),'jre_zairai_lcd_pids','approach-speakers.json');
    else YM_APPROACH_SPEAKERS=entries;
}
function ymSpeakersAtTick(world,now){
    // Reuse only within this exact tick, without stacking another cache TTL.
    if(YM_SPEAKER_READ&&YM_SPEAKER_READ.world===world&&YM_SPEAKER_READ.time===now)return YM_SPEAKER_READ.entries;
    var entries=ymSpeakerList(world,now);YM_SPEAKER_READ={world:world,time:now,entries:entries};return entries;
}
function ymSpeakerRefreshOffset(id){
    var hash=0;
    for(var i=0;i<id.length;i++)hash=(hash*31+id.charCodeAt(i))>>>0;
    return (hash%16)*1000;
}
function ymRegisterApproachSpeaker(state,pids,snap,now){
    if(typeof MinecraftClient==='undefined'||typeof MinecraftClient.localPlayer!=='function'||typeof Vector3f==='undefined'||
        typeof pids.blockPos!=='function'||(typeof pids.isKeyBlock==='function'&&!pids.isKeyBlock()))return;
    try{
        var center=ymAudioCoordinates(pids.blockPos().copy().add(.5,.5,.5));if(!center)return;
        var platforms=[],ids=typeof pids.getTargetPlatformIds==='function'?pids.getTargetPlatformIds():null;
        if(Array.isArray(ids))ids.forEach(function(id){var value=String(id);if(platforms.indexOf(value)<0)platforms.push(value);});
        else if(ids)for(var i=0;i<ids.size();i++){var value=String(ids.get(i));if(platforms.indexOf(value)<0)platforms.push(value);}
        if(!platforms.length)(snap.trains||[]).forEach(function(t){var id=ymExactId(t,'platformId');if(id&&platforms.indexOf(id)<0)platforms.push(id);});
        platforms.sort();var registration=JSON.stringify([center,platforms]),world=ymAudioWorld();
        var same=state.approachSpeakerRegistration===registration&&state.approachSpeakerWorld===world&&
            now>=state.approachSpeakerAt;
        if(same&&now<state.approachSpeakerRenewAt)return;
        var token=state.approachSpeakerToken||(state.approachSpeakerToken=String(now)+'/'+Math.random());
        var id=center.join('/');
        ymAudioTransaction(function(){
            var entries=ymSpeakerList(world,now).filter(function(e){return e.id!==id&&e.token!==token;});
            entries.push({world:world,id:id,token:token,platforms:platforms,pos:center,at:now});ymSaveSpeakers(entries);
        });
        state.approachSpeakerRegistration=registration;state.approachSpeakerWorld=world;state.approachSpeakerAt=now;
        // Register a new position immediately, then spread periodic rewrites
        // across screens without shortening the 90-second record lifetime.
        state.approachSpeakerRenewAt=now+30000+(same?0:ymSpeakerRefreshOffset(id));
        state.approachSpeakersReadAt=null;
    }catch(e){state.approachSoundError=String(e);}
}
function ymUnregisterApproachSpeaker(state){
    if(!state.approachSpeakerToken)return;
    try{
        var world=state.approachSpeakerWorld,token=state.approachSpeakerToken,now=Date.now();
        ymAudioTransaction(function(){ymSaveSpeakers(ymSpeakerList(world,now).filter(function(e){return e.token!==token;}));});
    }catch(e){state.approachSoundError=String(e);}
    state.approachSpeakerToken=null;state.approachSpeakerRegistration=null;state.approachSpeakerWorld=null;state.approachSpeakerAt=null;state.approachSpeakerRenewAt=null;
    state.approachSpeakersReadAt=null;state.approachSpeakers=null;
}
function ymNearestApproachCenter(state,platform,fallback,now){
    if(typeof MinecraftClient==='undefined'||typeof MinecraftClient.localPlayer!=='function'||typeof Vector3f==='undefined')return fallback;
    try{
        var player=MinecraftClient.localPlayer(),listener=player&&ymAudioCoordinates(player.pos());if(!listener)return fallback;
        if(state.approachSpeakersReadAt==null||now<state.approachSpeakersReadAt||now-state.approachSpeakersReadAt>=1000){
            var world=ymAudioWorld();state.approachSpeakers=ymAudioTransaction(function(){return ymSpeakersAtTick(world,now);});
            state.approachSpeakersReadAt=now;
        }
        var best=null,bestDistance=Infinity,list=state.approachSpeakers||[];
        for(var i=0;i<list.length;i++){
            var speaker=list[i];if(speaker.platforms.indexOf(platform)<0||now<speaker.at||now-speaker.at>=90000)continue;
            var dx=speaker.pos[0]-listener[0],dy=speaker.pos[1]-listener[1],dz=speaker.pos[2]-listener[2];
            var distance=Math.sqrt(dx*dx+dy*dy+dz*dz);
            if(distance<bestDistance){best=speaker;bestDistance=distance;}
        }
        // Every PIDS is the centre of its own 50-block sphere. Use the actual
        // nearest centre, including vertical distance, at every position update.
        state.approachSoundDistance=bestDistance;
        if(!best)return fallback;
        state.approachSoundSpeakerId=best.id;return new Vector3f(best.pos[0],best.pos[1],best.pos[2]);
    }catch(e){state.approachSoundError=String(e);return fallback;}
}
function ymRefreshApproachSoundPosition(state,now){
    if(!state.approachSound||!state.approachSoundPlatform||
        (!state.approachSoundDriver&&!state.approachSoundQueue&&now-state.approachSoundStarted>=(state.approachSoundHoldMs||4000)))return;
    if(state.approachSoundPositionAt!=null&&now>=state.approachSoundPositionAt&&now-state.approachSoundPositionAt<100)return;
    state.approachSoundPositionAt=now;
    var fallback=state.approachSoundCenter||state.approachSoundOrigin;
    var center=ymNearestApproachCenter(state,state.approachSoundPlatform,fallback,now);
    try{
        var next=ymAudioCoordinates(center),previous=ymAudioCoordinates(fallback);
        if(next&&previous?(next[0]!==previous[0]||next[1]!==previous[1]||next[2]!==previous[2]):next!==previous){
            state.approachSound.setPos(center);state.approachSoundCenter=center;
            if(state.approachSoundQueue)state.approachSoundQueue.center=center;
        }
        // Native LINEAR attenuation supplies the gain inside the sphere. A
        // silent out-of-range instance keeps its playhead for walking back in.
        var volume=state.approachSoundDistance>=50?0:(state.approachSoundGain||1);
        if(state.approachSoundVolumeObject!==state.approachSound||state.approachSoundVolume!==volume){
            state.approachSound.setSoundVolume(volume);state.approachSoundVolumeObject=state.approachSound;state.approachSoundVolume=volume;
        }
    }catch(e){state.approachSoundError=String(e);}
}
function ymFinishApproachPlayback(playback,stop){
    var state=playback.state;state.approachSoundDriver=null;
    try{ymApproachLease(state,Date.now(),!stop);}catch(e){state.approachSoundError=String(e);}
    if(stop&&state.approachSoundTrips)state.approachSoundTrips=state.approachSoundTrips.filter(function(key){return !ymSameTripKey(key,state.approachSoundTrip);});
    if(stop)ymStopApproachSound(playback.ctx,state);
    state.approachSound=null;state.approachSoundQueue=null;state.approachSoundVolumeObject=null;state.approachSoundVolume=null;
    playback.finished=true;
}
function ymTickApproachPlaybacks(now){
    // One daemon worker per active preset scope; no PIDS render/visibility is
    // needed to keep the same native sound positioned or to finish its tail.
    ymAudioTransaction(function(){
        for(var i=0;i<YM_APPROACH_PLAYBACKS.length;i++){
            var playback=YM_APPROACH_PLAYBACKS[i],state=playback.state;
            try{
                if(ymAudioWorld()!==playback.world||!MinecraftClient.localPlayer()){
                    ymFinishApproachPlayback(playback,true);continue;
                }
                var elapsed=Math.max(0,now-playback.lastTick);playback.lastTick=now;
                if(typeof MinecraftClient.gamePaused==='function'&&MinecraftClient.gamePaused()){
                    playback.deadline+=elapsed;state.approachSoundStarted+=elapsed;
                    if(state.approachSoundQueue){
                        state.approachSoundQueue.due+=elapsed;
                        if(state.approachSoundQueue.retryAt)state.approachSoundQueue.retryAt+=elapsed;
                        if(state.approachSoundQueue.renewAt)state.approachSoundQueue.renewAt+=elapsed;
                    }
                    continue;
                }
                if(now>playback.deadline){
                    ymFinishApproachPlayback(playback,true);continue;
                }
                if(now-(state.approachSoundLeaseAt||0)>=1000){
                    if(!ymApproachLease(state,now,null)){ymFinishApproachPlayback(playback,true);continue;}
                }
                ymRefreshApproachSoundPosition(state,now);
                if(state.approachSound&&now-state.approachSoundStarted>=1500&&
                    now-state.approachSoundStarted<(state.approachSoundDurationMs||0)-150&&!state.approachSound.isPlaying()){
                    // A resource reload/device reset lost this native instance.
                    // Release ownership so a screen can re-enter at the timeline.
                    ymFinishApproachPlayback(playback,true);continue;
                }
                if(ymContinueApproachSound(playback.ctx,state,now))continue;
                if(now-state.approachSoundStarted>=(state.approachSoundHoldMs||4000)&&
                    (!state.approachSound||!state.approachSound.isPlaying()))ymFinishApproachPlayback(playback,false);
            }catch(e){state.approachSoundError=String(e);ymFinishApproachPlayback(playback,true);}
        }
        YM_APPROACH_PLAYBACKS=YM_APPROACH_PLAYBACKS.filter(function(p){return !p.finished;});
        if(!YM_APPROACH_PLAYBACKS.length&&YM_APPROACH_RUNNER){YM_APPROACH_RUNNER.shutdown();YM_APPROACH_RUNNER=null;}
    });
}
function ymStartApproachPlayback(ctx,state,now){
    if(!ymAudioNativeStore()||typeof MinecraftClient==='undefined'||typeof MinecraftClient.localPlayer!=='function')return;
    var playback={ctx:ctx,state:state,world:ymAudioWorld(),deadline:now+120000,lastTick:now,finished:false};
    state.approachSoundDriver=playback;YM_APPROACH_PLAYBACKS.push(playback);
    if(!YM_APPROACH_RUNNER){
        try{
            YM_APPROACH_RUNNER=Packages.java.util.concurrent.Executors.newSingleThreadScheduledExecutor(function(task){
                var thread=new Packages.java.lang.Thread(task,'JREAST PIDS ATOS');thread.setDaemon(true);return thread;
            });
            YM_APPROACH_RUNNER.scheduleAtFixedRate(function(){ymTickApproachPlaybacks(Date.now());},100,100,Packages.java.util.concurrent.TimeUnit.MILLISECONDS);
        }catch(e){
            YM_APPROACH_PLAYBACKS.pop();state.approachSoundDriver=null;
            if(YM_APPROACH_RUNNER)YM_APPROACH_RUNNER.shutdown();YM_APPROACH_RUNNER=null;throw e;
        }
    }
}
function ymDetachApproachPlayback(state){
    var playback=state.approachSoundDriver;if(!playback||playback.finished)return false;
    // The worker owns just the audio fields after the block unloads. Release
    // the display state and texture normally, without restarting/stopping audio.
    var detached={};Object.keys(state).forEach(function(key){
        if(key.indexOf('approachSound')===0||key.indexOf('approachSpeakers')===0)detached[key]=state[key];
    });
    playback.state=detached;return true;
}
function ymReadApproachClaims(world,now){
    var entries=YM_APPROACH_CLAIMS;
    if(ymAudioNativeStore()){
        var raw=Files.hasData('jre_zairai_lcd_pids','approach-claims.json')?String(Files.readData('jre_zairai_lcd_pids','approach-claims.json').asString()):'[]';
        try{entries=JSON.parse(raw);}catch(e){entries=[];}
    }
    return Array.isArray(entries)?entries.filter(function(e){return e&&e.world===world&&isFinite(e.at)&&now>=e.at&&now-e.at<600000;}):[];
}
function ymSaveApproachClaims(entries){
    entries=entries.slice(-512);
    if(ymAudioNativeStore())Files.saveData(JSON.stringify(entries),'jre_zairai_lcd_pids','approach-claims.json');else YM_APPROACH_CLAIMS=entries;
}
function ymApproachLease(state,now,completed){
    if(!state.approachSoundOwner)return true;
    return ymAudioTransaction(function(){
        var entries=ymReadApproachClaims(ymAudioWorld(),now),found=false;
        for(var i=0;i<entries.length;i++){
            var entry=entries[i];if(!ymSameTripKey(entry.key,state.approachSoundTrip)||entry.owner!==state.approachSoundOwner)continue;
            found=true;entry.leaseAt=completed===null?now:0;if(completed!==null)entry.done=completed;
        }
        if(found)ymSaveApproachClaims(entries);state.approachSoundLeaseAt=now;return found;
    });
}
function ymClaimApproachSound(ctx,sound,train,key,now,holdMs,continuation,owner,managed){
    holdMs=Math.max(4000,Number(holdMs)||4000);
    // The two presets have separate Rhino scopes. Use JCM's small-data API
    // and a JVM-wide monitor shared with the lightweight playback worker.
    var nativeStore=ymAudioNativeStore(),world=ymAudioWorld();
    var platform=ymExactId(train,'platformId');
    function claim(){
        var entries=ymReadApproachClaims(world,now);
        var own=-1;
        for(var i=0;i<entries.length;i++)if(ymSameTripKey(entries[i].key,key))own=i;
        if(continuation&&(own<0||owner&&entries[own].owner!==owner||entries[own].done))return 'played';
        if(!continuation&&own>=0){
            var existing=entries[own];
            if(existing.done||!existing.managed)return 'played';
            if(existing.leaseAt&&now-existing.leaseAt<3000)return 'playing';
        }
        for(var j=0;j<entries.length;j++){
            var entry=entries[j],active=entry.managed?!entry.done&&entry.leaseAt&&now-entry.leaseAt<3000:
                now-entry.at<Math.max(4000,Number(entry.holdMs)||4000);
            if(!ymSameTripKey(entry.key,key)&&entry.platform===platform&&active)return 'busy';
        }
        var previous=entries.slice();
        var reservation={world:world,platform:platform,key:key,at:now,holdMs:holdMs,owner:owner||null,managed:!!managed,leaseAt:now,done:false};
        if(continuation&&own>=0){reservation.owner=entries[own].owner;reservation.managed=entries[own].managed;}
        if(own>=0)entries[own]=reservation;else entries.push(reservation);
        if(entries.length>512)entries=entries.slice(-512);
        ymSaveApproachClaims(entries);
        try{if(sound)ctx.soundManager().play(sound);}
        catch(e){
            ymSaveApproachClaims(previous);
            throw e;
        }
        return 'started';
    }
    return String(ymAudioTransaction(claim));
}
function ymStopApproachSound(ctx,state){
    state.approachSoundVolumeObject=null;state.approachSoundVolume=null;
    state.approachSoundQueue=null;
    if(!state.approachSound)return;
    try{if(ctx&&typeof ctx.soundManager==='function')ctx.soundManager().stop(state.approachSound);}
    catch(e){state.approachSoundError=String(e);}
    state.approachSound=null;
}
function ymPositionalApproachSound(id,center){
    return TickableSoundInstance.create(Resources.id(id),'BLOCKS')
        .setSoundVolume(1).setSoundPitch(1).setLoopable(false).setRelative(false).setPos(center);
}
function ymContinueApproachSound(ctx,state,now){
    var queue=state.approachSoundQueue;if(!queue)return false;
    if(now<state.approachSoundStarted){queue.due=now+queue.due-state.approachSoundStarted;state.approachSoundStarted=now;}
    if(now<queue.due||now<queue.retryAt)return true;
    try{
        // Wait for the native recording to finish as well as its measured
        // duration; a delayed audio submission must not overlap the car count.
        if(state.approachSound&&typeof state.approachSound.isPlaying==='function'&&state.approachSound.isPlaying()){
            if(now>=queue.renewAt){
                var renewed=ymClaimApproachSound(ctx,null,queue.train,state.approachSoundTrip,now,queue.clip.durationMs+1500,true,state.approachSoundOwner);
                if(renewed!=='started'){state.approachSoundQueue=null;return true;}
                state.approachSoundHoldMs=now-state.approachSoundStarted+queue.clip.durationMs+1500;
                queue.renewAt=now+1000;
            }
            queue.retryAt=now+100;return true;
        }
        var center=ymNearestApproachCenter(state,state.approachSoundPlatform,queue.center,now),gain=queue.clip.gain||1;
        var sound=ymPositionalApproachSound(queue.clip.id,center).setSoundVolume(state.approachSoundDistance>=50?0:gain);
        var hold=queue.clip.durationMs+500,remaining=queue.remaining||[];
        for(var i=0;i<remaining.length;i++)hold+=(remaining[i].gapMs||0)+remaining[i].durationMs;
        var result=ymClaimApproachSound(ctx,sound,queue.train,state.approachSoundTrip,now,hold,true,state.approachSoundOwner);
        if(result==='started'){
            state.approachSound=sound;state.approachSoundStarted=now;state.approachSoundHoldMs=hold;
            state.approachSoundCenter=center;state.approachSoundGain=gain;state.approachSoundDurationMs=queue.clip.durationMs;
            var next=remaining[0];state.approachSoundQueue=next?{clip:next,remaining:remaining.slice(1),train:queue.train,center:center,
                due:now+queue.clip.durationMs+(next.gapMs||0),retryAt:0,renewAt:0}:null;
        }else state.approachSoundQueue=null;
        // If another service already acquired the platform after a long pause,
        // drop this stale tail rather than speaking over that announcement.
        state.approachSoundError=null;
    }catch(e){
        queue.retryAt=now+1000;state.approachSoundError=String(e);
        if(now>queue.due+10000)state.approachSoundQueue=null;
        if(ctx&&typeof ctx.setDebugInfo==='function')ctx.setDebugInfo('PIDS approach sound',String(e));
    }
    return true;
}
function ymUpdateApproachSound(ctx,state,pids,snap,display,now){
    // The worker owns active managed playback. All mutations and claims still
    // run under the original shared lock; these are read-only early exits.
    if(state.approachSoundDriver)return;
    var refresh=state.approachSound&&state.approachSoundPlatform&&state.approachSoundStarted!=null&&
        now-state.approachSoundStarted<(state.approachSoundHoldMs||4000);
    if(!state.approachSoundQueue&&!refresh){
        if(!display.approach||Math.floor(now/500)%2!==0)return;
        var key=ymTripKey(snap.trains[0]),played=state.approachSoundTrips||[];
        if(!key||state.approachSoundRetry&&now<state.approachSoundRetry)return;
        for(var i=0;i<played.length;i++)if(ymSameTripKey(played[i],key))return;
    }
    ymAudioTransaction(function(){ymUpdateApproachSoundLocked(ctx,state,pids,snap,display,now);});
}
function ymUpdateApproachSoundLocked(ctx,state,pids,snap,display,now){
    if(typeof MinecraftClient!=='undefined'&&typeof MinecraftClient.gamePaused==='function'&&MinecraftClient.gamePaused())return;
    if(!state.approachSoundDriver)ymRefreshApproachSoundPosition(state,now);
    // A queued car-count sentence belongs to the started announcement, even
    // when the alert ended or the next arrival snapshot is temporarily empty.
    if(state.approachSoundDriver||ymContinueApproachSound(ctx,state,now))return;
    var key=ymTripKey(snap.trains[0]),active=display.approach;
    // The alert controls the start only. ETA/data changes must not cut off
    // this one-shot clip; the playback worker also survives a PIDS chunk unload.
    if(!active||Math.floor(now/500)%2!==0||!key||!ctx||typeof ctx.soundManager!=='function'||
        typeof TickableSoundInstance==='undefined'||typeof Resources==='undefined'||
        typeof pids.blockPos!=='function'||(typeof pids.isKeyBlock==='function'&&!pids.isKeyBlock()))return;
    var played=state.approachSoundTrips||(state.approachSoundTrips=[]);
    for(var i=0;i<played.length;i++)if(ymSameTripKey(played[i],key))return;
    if(state.approachSoundRetry&&now<state.approachSoundRetry)return;
    // Reserve the complete clip duration, including submission latency. A newly
    // selected service waits instead of cutting it off or overlapping.
    if(state.approachSound&&state.approachSoundStarted!=null){
        if(now<state.approachSoundStarted)state.approachSoundStarted=now;
        if(now-state.approachSoundStarted<(state.approachSoundHoldMs||4000))return;
    }
    try{
        // Mono positional audio, centred in the PIDS's controller block.
        var origin=pids.blockPos().copy().add(.5,.5,.5),platform=ymExactId(snap.trains[0],'platformId');
        var center=ymNearestApproachCenter(state,platform,origin,now);
        var clip=typeof ymAtosEntry==='function'?ymAtosEntry(snap.trains[0],now):{id:'yamanote:atos_approach',durationMs:3356,holdMs:4000};
        if(clip.expired){played.push(key);if(played.length>8)played.shift();return;}
        var gain=clip.gain||1,sound=clip.waitMs>0?null:ymPositionalApproachSound(clip.id,center).setSoundVolume(state.approachSoundDistance>=50?0:gain);
        var owner=String(now)+'/'+Math.random(),managed=ymAudioNativeStore()&&typeof MinecraftClient!=='undefined'&&typeof MinecraftClient.localPlayer==='function';
        var result=ymClaimApproachSound(ctx,sound,snap.trains[0],key,now,clip.holdMs,false,owner,managed);
        if(result==='busy'||result==='playing'){state.approachSoundRetry=now+1000;return;}
        if(result==='started'){
            state.approachSound=sound;state.approachSoundTrip=key;state.approachSoundStarted=now;state.approachSoundHoldMs=clip.holdMs;
            state.approachSoundOwner=owner;state.approachSoundLeaseAt=now;state.approachSoundDurationMs=sound?clip.durationMs:0;state.approachSoundGain=gain;
            state.approachSoundEntryOffsetMs=clip.entryOffsetMs||0;
            state.approachSoundOrigin=origin;state.approachSoundCenter=center;state.approachSoundPlatform=platform;
            var remaining=clip.next?[clip.next].concat(clip.after||[]):[];
            if(clip.waitMs>0)state.approachSoundQueue={clip:clip,remaining:remaining,train:snap.trains[0],center:center,due:now+clip.waitMs,retryAt:0,renewAt:0};
            else state.approachSoundQueue=clip.next?{clip:clip.next,remaining:clip.after||[],train:snap.trains[0],center:center,due:now+clip.durationMs+(clip.nextGapMs==null?250:clip.nextGapMs),retryAt:0,renewAt:0}:null;
            ymStartApproachPlayback(ctx,state,now);
        }
        played.push(key);if(played.length>8)played.shift();state.approachSoundRetry=null;state.approachSoundError=null;
    }catch(e){
        state.approachSoundRetry=now+1000;state.approachSoundError=String(e);
        if(typeof ctx.setDebugInfo==='function')ctx.setDebugInfo('PIDS approach sound',String(e));
    }
}
function dispose(ctx,state,pids){
    ymAudioTransaction(function(){
        if(!ymDetachApproachPlayback(state))ymStopApproachSound(ctx,state);
        ymUnregisterApproachSpeaker(state);
        Object.keys(state).forEach(function(key){if(key.indexOf('approachSound')===0)state[key]=null;});
    });
    if(state.texture){state.texture.close();state.texture=null;}state.fonts=null;state.lastScene=null;state.rasterCommands=null;state.rasterTransform=null;state.roundedCase=null;state.stopObservations=null;state.stopOwners=null;state.snapshot=null;state.lastPoll=null;state.visualKey=null;state.presentationKey=null;state.routeMetadata=null;state.noticeCycle=null;state.displaySnapshot=null;state.displayResult=null;state.displayDue=null;state.displayLastNow=null;
}
function ymPresentationKey(snap,now){
    var values=[String(snap.platformName),!!snap.mixedComposition,!!snap.englishOnly,snap.isPlatformNumberHidden(),snap.facing||'',snap.stationName||'',snap.stationNames||{},snap.noticeMessages||[]],i;
    var options=Object.keys(YAMANOTE_DEFAULTS);
    for(i=0;i<options.length;i++)values.push(ymOption(options[i]));
    for(i=0;i<snap.groups.length;i++){
        var group=snap.groups[i];
        values.push([String(group.name),String(group.number),Number(group.color),group.directions,group.platform,group.destination]);
    }
    // Only visible rows need layout keys; all arrivals still participate in
    // group selection and mixed-composition detection during the one-second poll.
    for(i=0;i<2;i++){
        var train=snap.trains[i];
        values.push(String(snap.getCustomMessage(i)||''),snap.isRowHidden(i));
        values.push(train?[ymStatus(train,now,i===0?snap.stopObservations:null),ymExactId(train,'platformId'),
            String(train.routeName()),String(train.routeNumber()),Number(train.routeColor()),String(train.destination()),train._destinationStationName||'',
            ymTime(ymOption('timeSource')==='departure'?train.departureTime():train.arrivalTime()),
            snap.mixedComposition?ymCarCount(train):0]:null);
    }
    return JSON.stringify(values);
}
function ymSetDisplayProfile(state,pids){
    state.roundedHousing=typeof ymHousingEnabled==='function'&&ymHousingEnabled(pids);
    state.equalRapidGaps=String(pids.type)==='lcd_pids'||String(pids.type)==='pids_1a';
}
function render(ctx,state,pids){
    var now=Date.now(),fresh=!state.snapshot||state.lastPoll==null||now<state.lastPoll||now-state.lastPoll>=1000;
    if(fresh){state.snapshot=ymPoll(pids,now,state);state.lastPoll=now;}
    if(fresh)ymRegisterApproachSpeaker(state,pids,state.snapshot,now);
    var snap=state.snapshot,display=ymScheduledDisplayPhase(snap,now,state),blink=display.approach;
    ymUpdateApproachSound(ctx,state,pids,snap,display,now);
    state.platformSide=ymPlatformSide(snap.facing);
    ymSetDisplayProfile(state,pids);
    var visualKey=(blink?'approach/'+Math.floor(now/500):display.announcement?'notice/'+display.announcement.travel:'static')+'/'+ymLanguage(now,snap,state)+'/'+state.platformSide;
    var presentationKey=fresh?ymPresentationKey(snap,now):state.presentationKey;
    if(state.texture&&state.visualKey===visualKey&&state.presentationKey===presentationKey){ymDrawRaster(ctx,state,pids);return;}
    // Animation uses the snapshot and never scans vehicles/routes between polls.
    ymPaint(ctx,state,pids,ymBuildScene(state.snapshot,now,state,display));state.visualKey=visualKey;state.presentationKey=presentationKey;
}
