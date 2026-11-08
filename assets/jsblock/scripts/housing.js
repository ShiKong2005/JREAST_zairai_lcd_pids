/* Author: Shi_Kong233 | JREAST_zairai_lcd_pids v1.4 */
// Coordinates follow the approved front elevation in a 1740 x 496 design grid.
var YM_CASE_WIDTH=1740,YM_CASE_HEIGHT=496,YM_CASE_SCALE=.96/496;
var YM_CASE_FRONT=-.067,YM_CASE_REAR=.341,YM_CASE_RECESS=.012;
var YM_CASE_ARC_STEPS=6;
var YM_CASE_MESHES=[null,null];

function ymHousingEnabled(pids){
    var type=String(pids.type),width=Number(pids.width),height=Number(pids.height);
    return type==='lcd_pids'&&width===133&&height===72;
}

function ymHousingOutline(inset,radius){
    var centers=[
        [YM_CASE_WIDTH-inset-radius,inset+radius,-90],
        [YM_CASE_WIDTH-inset-radius,YM_CASE_HEIGHT-inset-radius,0],
        [inset+radius,YM_CASE_HEIGHT-inset-radius,90],
        [inset+radius,inset+radius,180]
    ],points=[];
    centers.forEach(function(center){
        for(var i=0;i<=YM_CASE_ARC_STEPS;i++){
            var angle=(center[2]+90*i/YM_CASE_ARC_STEPS)*Math.PI/180;
            points.push([center[0]+radius*Math.cos(angle),center[1]+radius*Math.sin(angle)]);
        }
    });
    return points;
}

function ymHousingGeometry(width,height,right){
    var originX=width/192-YM_CASE_WIDTH*YM_CASE_SCALE/2;
    var originY=height/192-YM_CASE_HEIGHT*YM_CASE_SCALE/2;
    var outline=ymHousingOutline(0,91),inner=ymHousingOutline(20,72),quads=[],displays=[];
    function point(x,y,z){return [originX+x*YM_CASE_SCALE,originY+y*YM_CASE_SCALE,z];}
    function quad(points,color,reverse){
        if(reverse)points.reverse();
        quads.push({points:points,color:color});
    }
    function flat(x0,y0,x1,y1,x2,y2,x3,y3,z,color,reverse){
        quad([point(x0,y0,z),point(x1,y1,z),point(x2,y2,z),point(x3,y3,z)],color,reverse);
    }
    function ring(outside,inside,zOuter,zInner,color,reverse){
        outside.forEach(function(a,i){
            var j=(i+1)%outside.length,b=outside[j],c=inside[j],d=inside[i];
            quad([point(a[0],a[1],zOuter),point(b[0],b[1],zOuter),
                point(c[0],c[1],zInner),point(d[0],d[1],zInner)],color,reverse);
        });
    }
    ring(outline,outline,YM_CASE_FRONT+.008,YM_CASE_REAR-.008,0x29292B,false);

    // The left arc supplies the outer edge of the trapezoids used for each cap.
    var edges=inner.filter(function(p){return p[0]<YM_CASE_WIDTH/2;}).sort(function(a,b){return a[1]-b[1];});
    function edgeAt(y){
        for(var i=1;i<edges.length;i++){
            var a=edges[i-1],b=edges[i];
            if(y<=b[1]+1e-8)return a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]);
        }
        return edges[edges.length-1][0];
    }
    [false,true].forEach(function(back){
        var reverse=!back,sign=back?1:-1;
        var lip=back?YM_CASE_REAR:YM_CASE_FRONT,screen=lip-sign*YM_CASE_RECESS;
        var panelX=right?56:396;
        // Both viewers see the same physical opening from opposite sides.
        var numberX=panelX>56?42:YM_CASE_WIDTH-42-312;
        var x0=panelX-7,x1=panelX+1288+7,y0=41,y1=455;
        ring(outline,inner,lip-sign*.008,lip,0x535356,reverse);
        var bands=edges.map(function(p){return p[1];}).concat([y0,y1]).sort(function(a,b){return a-b;});
        for(var i=1;i<bands.length;i++){
            var t=bands[i-1],b=bands[i],lt=edgeAt(t),lb=edgeAt(b);
            if(b<=y0||t>=y1){
                flat(lt,t,YM_CASE_WIDTH-lt,t,YM_CASE_WIDTH-lb,b,lb,b,lip,0x333333,reverse);
            }else{
                flat(lt,t,x0,t,x0,b,lb,b,lip,0x333333,reverse);
                flat(x1,t,YM_CASE_WIDTH-lt,t,YM_CASE_WIDTH-lb,b,x1,b,lip,0x333333,reverse);
            }
        }
        var opening=[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
        ring(opening,opening,lip,screen,0x1D1D1E,reverse);
        flat(x0,y0,x1,y0,x1,y1,x0,y1,screen,0x151516,reverse);
        var u0=right?0:.195,u1=right?.805:1;
        displays.push({x:point(panelX+(back?1288:0),48,0)[0],y:point(0,48,0)[1],
            width:(back?-1:1)*1288*YM_CASE_SCALE,height:400*YM_CASE_SCALE,z:screen+sign*.001,u0:u0,u1:u1});
        displays.push({x:point(numberX+(back?312:0),48,0)[0],y:point(0,48,0)[1],
            width:(back?-1:1)*312*YM_CASE_SCALE,height:400*YM_CASE_SCALE,z:lip+sign*.001,
            u0:right?.805:0,u1:right?1:.195});
    });
    return {quads:quads,displays:displays};
}

function ymHousingMesh(width,height,right){
    var side=right?1:0,mesh=YM_CASE_MESHES[side];
    if(mesh&&mesh.width===width&&mesh.height===height)return mesh;
    var geometry=ymHousingGeometry(width,height,right);
    var solid=geometry.quads.map(function(quad){
        // QuadDrawCall uses Y-up and applies a 180-degree X rotation before drawing.
        var p=quad.points.map(function(v){return new Vector3f(v[0],-v[1],-v[2]);});
        return QuadDrawCall.create().renderType('EXTERIOR').color(quad.color).quad(p[0],p[1],p[2],p[3]);
    });
    // Static calls carry neither the board texture nor its world transform.
    mesh={width:width,height:height,solid:solid,displays:geometry.displays};
    YM_CASE_MESHES[side]=mesh;
    return mesh;
}

function ymDrawHousing(ctx,state,pids){
    var width=Number(pids.width),height=Number(pids.height),right=state.platformSide==='right';
    var texture=state.texture.identifier,cache=state.roundedCase;
    if(!cache||cache.width!==width||cache.height!==height||cache.right!==right||!cache.texture.equals(texture)){
        var mesh=ymHousingMesh(width,height,right);
        var screens=mesh.displays.map(function(face){
            var matrix=new Matrices();
            matrix.translate(0,0,-face.z);
            return Texture.create().texture(texture).pos(face.x*96,face.y*96)
                .size(face.width*96,face.height*96).uv(face.u0,0,face.u1,1).zOrder(0).matrices(matrix);
        });
        cache=state.roundedCase={width:width,height:height,right:right,texture:texture,solid:mesh.solid,screens:screens};
    }
    var manager=ctx.renderManager();
    // Matrix and UVs are fixed. Queue directly so automatic depth ordering does not mutate cached calls.
    cache.solid.forEach(function(draw){manager.draw(draw);});
    cache.screens.forEach(function(draw){manager.draw(draw);});
}
