/* Author: Shi_Kong233 | JREAST_zairai_lcd_pids v1.4 */
/* Plain snapshots of MTR data. Live getters run only in the 1-second poll. */
var YM_NETWORK_CACHE=null,YM_VEHICLE_CACHE=null;
var YM_NETWORK_REFRESH_MS=5000;
function ymSameWorld(a,b){return a===b||!!(a&&b&&typeof a.equals==='function'&&a.equals(b));}
function ymNetworkCount(collection){
    if(!collection)return 0;
    return typeof collection.size==='function'?Number(collection.size()):collection.length;
}
function ymSharedNetwork(data,now){
    var old=YM_NETWORK_CACHE;
    // MTR updates collections in place. Size changes refresh immediately;
    // edits to existing entries are picked up by the bounded refresh interval.
    var stations=data?ymNetworkCount(data.stations):0;
    var routes=data?ymNetworkCount(data.routes):0;
    var simplified=data?ymNetworkCount(data.simplifiedRoutes):0;
    if(old&&ymSameWorld(old.data,data)&&now>=old.time&&now-old.time<YM_NETWORK_REFRESH_MS&&
        old.stations===stations&&old.routes===routes&&old.simplified===simplified)return old.value;
    var value=ymReadNetwork(data);
    YM_NETWORK_CACHE={data:data,time:now,value:value,stations:stations,routes:routes,simplified:simplified};
    return value;
}
function ymSharedVehicles(data,now){
    var old=YM_VEHICLE_CACHE;
    // Coalesce screens polled together without adding a full second to door response.
    if(old&&ymSameWorld(old.data,data)&&now>=old.time&&now-old.time<50)return old.value;
    var value=ymVehicleStates(data);YM_VEHICLE_CACHE={data:data,time:now,value:value};return value;
}
function ymExactId(object,method) {
    if(!object)return '';
    // Rhino retains a Java getter's Long until JS coerces it to a number.
    // Convert directly in Java; reflection is forbidden by JCM's class shutter.
    var value=object[method]();
    if(typeof java!=='undefined'&&typeof value!=='string')return String(java.lang.Long.toString(value));
    return String(value);
}
function ymEach(collection,callback) {
    if(!collection)return;
    if(Array.isArray(collection)){collection.forEach(callback);return;}
    var iterator=collection.iterator();while(iterator.hasNext())callback(iterator.next());
}
function ymLineIdentity(name) {return String(name==null?'':name).split('|')[0];}
function ymReadNetwork(data) {
    var network={routes:[],byId:Object.create(null),byPlatform:Object.create(null),stationLines:Object.create(null),stationNamesById:Object.create(null)},numbers=Object.create(null);
    if(!data)return network;
    ymEach(data.stations,function(station){network.stationNamesById[ymExactId(station,'getId')]=String(station.getName());});
    ymEach(data.routes,function(route){numbers[ymExactId(route,'getId')]=String(route.getRouteNumber());});
    ymEach(data.simplifiedRoutes,function(route){
        var r={id:ymExactId(route,'getId'),name:String(route.getName()),color:Number(route.getColor()),stops:[]};
        r.line=ymLineIdentity(r.name);r.number=numbers[r.id]||'';
        ymEach(route.getPlatforms(),function(platform){
            var stop={platform:ymExactId(platform,'getPlatformId'),station:ymExactId(platform,'getStationId'),name:String(platform.getStationName()),destination:String(platform.getDestination()),transfers:[]};
            if(typeof platform.forEach==='function')platform.forEach(function(color,names){names.forEach(function(name){stop.transfers.push(ymLineIdentity(name));});});
            r.stops.push(stop);
            if(stop.station!=='0'){
                var lines=network.stationLines[stop.station]||(network.stationLines[stop.station]=Object.create(null));lines[r.line]=true;
            }
        });
        network.routes.push(r);network.byId[r.id]=r;
        var indexed=Object.create(null);
        r.stops.forEach(function(stop){if(!indexed[stop.platform]){indexed[stop.platform]=true;(network.byPlatform[stop.platform]||(network.byPlatform[stop.platform]=[])).push(r);}});
    });
    return network;
}
function ymEvenly(items,count) {
    if(count<=0)return [];
    if(items.length<=count)return items.slice();
    var chosen=[];
    for(var k=1;k<=count;k++)chosen.push(items[Math.round(k*(items.length+1)/(count+1))-1]);
    return chosen;
}
function ymSelectDirections(route,platform,destination,limit,network) {
    var dest=String(destination||''),destName=ymLineIdentity(dest.split('||')[0]),candidates=[],seen={},start=-1;
    if(route){
        for(var i=0;i<route.stops.length;i++)if(route.stops[i].platform===platform){start=i;break;}
        if(!dest&&route.stops.length)dest=route.stops[route.stops.length-1].name;
        destName=ymLineIdentity(dest.split('||')[0]);
        // Walk only the selected route's downstream stops, ending at its destination.
        for(i=start+1;start>=0&&i<route.stops.length;i++){
            var stop=route.stops[i],name=ymLineIdentity(stop.name),station=stop.station!=='0'?stop.station:name;
            if(name===destName||i===route.stops.length-1)break;
            if(!name||seen[station])continue;seen[station]=true;
            var interchange=false,lines=network.stationLines[stop.station]||{};
            for(var line in lines)if(line!==route.line)interchange=true;
            for(var j=0;j<stop.transfers.length;j++)if(stop.transfers[j]!==route.line)interchange=true;
            candidates.push({name:stop.name,index:i,transfer:interchange});
        }
    }
    var slots=Math.max(0,limit-(dest?1:0));
    var priority=candidates.filter(function(s){return s.transfer;}).slice(0,slots);
    var ordinary=candidates.filter(function(s){return !s.transfer;});
    var selected=priority.concat(ymEvenly(ordinary,slots-priority.length));
    selected.sort(function(a,b){return a.index-b.index;});
    var result=selected.map(function(s){return s.name;});if(dest)result.push(dest);
    return result;
}
function ymDirectionText(names,lang) {
    var local=names.map(function(name){return ymDestination(name,lang).text;});
    if(!local.length)return lang?'Departure information':'列車案内';
    if(!lang)return local.join('・')+'方面';
    return 'for '+(local.length>1?local.slice(0,-1).join(', ')+' & '+local[local.length-1]:local[0]);
}
function ymHeaderGroups(network,targets,trains) {
    var groups=[],byLine=Object.create(null);
    function add(route,train,platform){
        var name=route?route.name:train.routeName(),line=ymLineIdentity(name);
        var existing=byLine[line];if(existing)return;
        var stop=null;
        if(route)for(var i=0;i<route.stops.length;i++)if(route.stops[i].platform===platform){stop=route.stops[i];break;}
        var destination=train?train.destination():(stop&&stop.destination)|| (route&&route.stops.length?route.stops[route.stops.length-1].name:'');
        var group={line:line,name:name,color:train?train.routeColor():route.color,number:train?train.routeNumber():route.number,destination:destination,platform:platform,route:route};
        byLine[line]=group;groups.push(group);
    }
    // Current arrivals choose the representative direction/branch for each line.
    trains.forEach(function(train){
        var platform=ymExactId(train,'platformId');
        if(!targets.length||targets.indexOf(platform)>=0)add(network.byId[ymExactId(train,'routeId')]||null,train,platform);
    });
    var serving=network.routes;
    if(network.byPlatform){serving=[];var seenRoutes=Object.create(null);targets.forEach(function(target){(network.byPlatform[target]||[]).forEach(function(route){if(!seenRoutes[route.id]){seenRoutes[route.id]=true;serving.push(route);}});});}
    serving.forEach(function(route){
        for(var i=0;i<route.stops.length;i++)if(targets.indexOf(route.stops[i].platform)>=0){add(route,null,route.stops[i].platform);break;}
    });
    // Stable alphabetical order avoids page reordering with each arriving train.
    groups.sort(function(a,b){return a.line<b.line?-1:a.line>b.line?1:0;});groups=groups.slice(0,2);
    var limit=3;
    groups.forEach(function(group){group.directions=ymSelectDirections(group.route,group.platform,group.destination,limit,network);});
    return groups;
}
var YM_TRAIN_FIELDS=['destination','platformName','arrivalTime','departureTime','deviation','departureIndex','carCount'];
function YMTrainSnapshot(){}
// Shared accessors preserve the existing interface without per-arrival closures.
YM_TRAIN_FIELDS.concat(['routeId','platformId']).forEach(function(field){
    YMTrainSnapshot.prototype[field]=function(){return this['_'+field];};
});
['routeName','routeNumber','routeColor'].forEach(function(field){
    YMTrainSnapshot.prototype[field]=function(){return this._route[field];};
});
function ymSnapshotTrain(train,previousRoutes,currentRoutes) {
    var copy=new YMTrainSnapshot(),id=ymExactId(train,'routeId');
    copy._routeId=id;copy._platformId=ymExactId(train,'platformId');
    var rawName=train.routeName(),rawNumber=train.routeNumber();
    var name=rawName==null?'':String(rawName),number=rawNumber==null?'':String(rawNumber),color=Number(train.routeColor());
    var route=currentRoutes&&currentRoutes[id]||previousRoutes&&previousRoutes[id];
    if(!route||route.routeName!==name||route.routeNumber!==number||route.routeColor!==color)
        route={routeName:name,routeNumber:number,routeColor:color};
    copy._route=route;if(currentRoutes)currentRoutes[id]=route;
    for(var i=0;i<YM_TRAIN_FIELDS.length;i++){
        var field=YM_TRAIN_FIELDS[i];copy['_'+field]=typeof train[field]==='function'?train[field]():undefined;
    }
    copy._tripKey=ymTripKey(train);return copy;
}
function ymNeedsVehicles(first,now,state){
    // Retain the existing early-opening window and old-vehicle ownership checks.
    return !!(first&&Number(first.departureTime())>now&&Math.abs(Number(first.arrivalTime())-now)<=120000)||
        !!(state.stopOwners&&Object.keys(state.stopOwners).length);
}
function ymCarCount(train){
    var count=train&&typeof train.carCount==='function'?Number(train.carCount()):0;
    return isFinite(count)&&count>0&&Math.floor(count)===count?count:0;
}
function ymMixedComposition(trains){
    var first=0;
    for(var i=0;i<trains.length;i++){
        var count=ymCarCount(trains[i]);
        if(count){if(first&&first!==count)return true;first=count;}
    }
    return false;
}
function ymStationNames(network,trains,targets) {
    var names=Object.create(null),ids=targets.slice();
    trains.forEach(function(t){var id=ymExactId(t,'platformId');if(ids.indexOf(id)<0)ids.push(id);});
    ids.forEach(function(id){
        var routes=network.byPlatform&&network.byPlatform[id]||[];
        for(var r=0;r<routes.length;r++)for(var s=0;s<routes[r].stops.length;s++){
            var stop=routes[r].stops[s];if(stop.platform===id&&stop.name){names[id]=stop.name;return;}
        }
    });
    return names;
}
function ymDestinationStationName(network,train) {
    var route=network.byId[ymExactId(train,'routeId')];if(!route)return '';
    var platform=ymExactId(train,'platformId');
    var destination=ymString(train.destination()).split('||')[0],start=-1,found='',stationId='';
    var names=destination.split('|').filter(function(name){return !!name;});
    if(!names.length)return '';
    for(var i=0;i<route.stops.length;i++)if(route.stops[i].platform===platform){start=i;break;}
    if(start<0)return '';
    for(i=start;i<route.stops.length;i++){
        var stop=route.stops[i],name=network.stationNamesById&&network.stationNamesById[stop.station]||stop.name;
        var aliases=String(name||'').split('||')[0].split('|');
        if(!aliases.some(function(alias){return !!alias&&names.indexOf(alias)>=0;}))continue;
        var id=stop.station&&stop.station!=='0'?stop.station:stop.platform;
        if(stationId&&stationId!==id)return ''; // Duplicate names at different stations are ambiguous.
        stationId=id;found=name;
    }
    return found;
}
function ymPoll(pids,now,state) {
    var arrivals=pids.arrivals(),trains=[],targets=[],targetIds=pids.getTargetPlatformIds(),routes=Object.create(null);
    if(arrivals){
        if(typeof arrivals.forEach==='function')arrivals.forEach(function(train){trains.push(ymSnapshotTrain(train,state.routeMetadata,routes));});
        else for(var i=0;i<2;i++){var train=arrivals.get(i);if(train)trains.push(ymSnapshotTrain(train,state.routeMetadata,routes));}
    }
    state.routeMetadata=routes; // Only currently returned routes are retained.
    if(targetIds)for(var j=0;j<targetIds.size();j++)targets.push(String(targetIds.get(j)));
    // Normalize Java message strings once at the snapshot boundary.
    var custom=[],noticeMessages=[],rowCount=Math.min(3,Math.max(2,Number(pids.rows)||2));
    for(var row=0;row<rowCount;row++){
        var raw=ymString(pids.getCustomMessage(row)),announcement=ymParseNotice(raw);
        custom.push(announcement?'':raw);if(announcement)noticeMessages.push(announcement);
    }
    var hidden=[pids.isRowHidden(0),pids.isRowHidden(1)],hidePlatform=pids.isPlatformNumberHidden();
    var data=typeof MTRClientData==='undefined'?null:MTRClientData.getInstance(),network;
    try{network=ymSharedNetwork(data,now);}catch(e){network={routes:[],byId:{},stationLines:{}};}
    // Later arrivals still supply line groups and car counts, but only the
    // two timetable rows can use a resolved destination station code.
    for(var rowIndex=0;rowIndex<2&&rowIndex<trains.length;rowIndex++){
        if(!custom[rowIndex]&&!hidden[rowIndex])
            trains[rowIndex]._destinationStationName=ymDestinationStationName(network,trains[rowIndex]);
    }
    var platformName=trains.length?String(trains[0].platformName()):'';
    if(!platformName&&data&&targetIds&&targetIds.size()===1){var platform=data.platformIdMap.get(targetIds.get(0));if(platform)platformName=String(platform.getName());}
    var stationName='';
    try{var station=typeof pids.station==='function'?pids.station():null;if(station)stationName=String(station.getName());}catch(e){/* Outside a station or unloaded. */}
    var snapshot={trains:trains,noticeMessages:noticeMessages,noticeKey:JSON.stringify(noticeMessages),platformName:platformName,stationName:stationName,stationNames:ymStationNames(network,trains,targets),facing:ymReadFacing(pids),groups:ymHeaderGroups(network,targets,trains),mixedComposition:ymMixedComposition(trains),
        arrivals:function(){return {get:function(i){return trains[i]||null;}};},
        getCustomMessage:function(i){return custom[i];},isRowHidden:function(i){return hidden[i];},isPlatformNumberHidden:function(){return hidePlatform;}};
    var vehicles=ymNeedsVehicles(trains[0],now,state)?ymSharedVehicles(data,now):[];
    snapshot.stopObservations=ymStopObservations(snapshot.arrivals(),now,state,vehicles);
    snapshot.englishOnly=ymEnglishOnly(snapshot);
    return snapshot;
}
