/* Author: Shi_Kong233 | JREAST_zairai_lcd_pids v1.4 */
/* Unified Noto Sans CJK outlines for Chinese, Japanese, English and numbers. */
var YM_FONT=null;
function ymCreateRaster(state){
    if(!YM_FONT)YM_FONT={
        bold:Resources.readFont(Resources.id('yamanote:fonts/noto-sans-cjk-jp-bold.otf')),
        medium:Resources.readFont(Resources.id('yamanote:fonts/noto-sans-cjk-jp-medium.otf')),
        digits:Resources.readFont(Resources.id('yamanote:fonts/lcd-digits-regular.otf'))
    };
    var requested=Number(ymOption('textureWidth'));
    var width=isFinite(requested)?Math.max(512,Math.min(1600,Math.round(requested/4)*4)):1024;
    if(state.texture && state.textureWidth!==width){state.texture.close();state.texture=null;}
    if(!state.texture){
        state.textureWidth=width;state.texture=new GraphicsTexture(width,width/4);
        state.lastScene=null;state.rasterCommands=null;state.rasterTransform=null;state.fonts={};
    }
}
function ymSoftTrainIcon(g,x,y,h,color){
    var w=h*.58,body=h*.77;
    function round(rx,ry,rw,rh,r,c){g.setColor(new java.awt.Color(c));g.fill(new java.awt.geom.RoundRectangle2D.Double(rx,ry,rw,rh,r,r));}
    round(x,y,w,body,w*.20,color);
    round(x+w*.30,y+h*.045,w*.40,h*.035,h*.02,0);
    round(x+w*.13,y+h*.16,w*.74,h*.27,w*.07,0);
    round(x+w*.16,y+h*.57,w*.13,w*.13,w*.13,0);
    round(x+w*.71,y+h*.57,w*.13,w*.13,w*.13,0);
    var old=g.getStroke();g.setColor(new java.awt.Color(color));
    g.setStroke(new java.awt.BasicStroke(h*.075,java.awt.BasicStroke.CAP_ROUND,java.awt.BasicStroke.JOIN_ROUND));
    g.draw(new java.awt.geom.Line2D.Double(x+w*.30,y+body-h*.025,x+w*.06,y+h*.94));
    g.draw(new java.awt.geom.Line2D.Double(x+w*.70,y+body-h*.025,x+w*.94,y+h*.94));
    g.setStroke(old);
}
function ymNoticeLayout(g,segments,height,font,fonts){
    var context=g.getFontRenderContext(),key=JSON.stringify([segments,height]),cached=fonts._noticeLayout;
    if(cached&&cached.key===key&&cached.context.equals(context))return cached;
    var face=font.bold.deriveFont(java.awt.Font.PLAIN,height*4*.90),parts=[],advance=0,minY=0,maxY=0;
    for(var i=0;i<segments.length;i++){
        var segment=segments[i],glyph=face.createGlyphVector(context,new java.lang.String(segment.text));
        var bounds=glyph.getVisualBounds();minY=Math.min(minY,bounds.getY());maxY=Math.max(maxY,bounds.getMaxY());
        parts.push({outline:glyph.getOutline(),x:advance,color:segment.color});
        advance+=glyph.getGlyphPosition(glyph.getNumGlyphs()).getX();
    }
    cached={key:key,context:context,parts:parts,width:advance/4,minY:minY,maxY:maxY};
    fonts._noticeLayout=cached;return cached;
}
function ymRasterNotice(g,c,font,fonts){
    var layout=ymNoticeLayout(g,c.segments,c.textHeight||c.h,font,fonts),local=g.create();
    var x=c.x*4,y=c.y*4,w=c.w*4,h=c.h*4;
    try{
        local.clip(new java.awt.geom.Rectangle2D.Double(x,y,w,h));
        local.setColor(new java.awt.Color(0));local.fill(new java.awt.geom.Rectangle2D.Double(x,y,w,h));
        // The two red fades and short black gaps remain fixed. Only the
        // central window scrolls; text never enters either side treatment.
        var inset=w*YM_NOTICE_STYLE.inset/YM_NOTICE_STYLE.width,outerClip=local.getClip();
        local.clip(new java.awt.geom.Rectangle2D.Double(x+inset,y,w-2*inset,h));
        var origin=x+w-inset-c.travel*4,baseline=y+(h-(layout.maxY-layout.minY))/2-layout.minY;
        for(var i=0;i<layout.parts.length;i++){
            var part=layout.parts[i],transform=local.getTransform();
            local.setColor(new java.awt.Color(part.color));local.translate(origin+part.x,baseline);local.fill(part.outline);local.setTransform(transform);
        }
        local.setClip(outerClip);
        // Fades are narrower than the inset, leaving a fixed black gap.
        var red=java.awt.Color.RED,clear=new java.awt.Color(0x00FF0000,true),edge=w*YM_NOTICE_STYLE.fade/YM_NOTICE_STYLE.width;
        local.setPaint(new java.awt.GradientPaint(x,y,red,x+edge,y,clear));local.fill(new java.awt.geom.Rectangle2D.Double(x,y,edge,h));
        local.setPaint(new java.awt.GradientPaint(x+w-edge,y,clear,x+w,y,red));local.fill(new java.awt.geom.Rectangle2D.Double(x+w-edge,y,edge,h));
    }finally{local.dispose();}
}
function ymTrackedGlyph(font,context,text,h,role){
    var glyph=font.createGlyphVector(context,new java.lang.String(text));
    var tracking=(role==='clock'?0.012:role==='platform'?0.005:0.003)*h;
    for(var j=0;j<=glyph.getNumGlyphs();j++){
        var point=glyph.getGlyphPosition(j);
        glyph.setGlyphPosition(j,new java.awt.geom.Point2D.Double(point.getX()+j*tracking,point.getY()));
    }
    return {bounds:glyph.getVisualBounds(),outline:glyph.getOutline()};
}
function ymServicePairLayout(bounds,peer,x,y,w,h,align,diagonal,filled){
    // Use one natural-proportion scale for the entire pair, maximizing size
    // within the expanded text area without stretching letters sideways.
    var fit=Math.min(h/Math.max(bounds.getHeight(),peer.getHeight()),w/Math.max(bounds.getWidth(),peer.getWidth()));
    // Short grade pairs can grow into the central gap. Their full-height
    // boxes may overlap vertically, but their actual ink stays apart in X.
    if(diagonal)fit=Math.min(h/Math.max(bounds.getHeight(),peer.getHeight()),(w-4)/(bounds.getWidth()+peer.getWidth()));
    if(diagonal&&filled){
        // Dense pairs may fit better above/below each other. Either placement
        // keeps the common font size and leaves actual glyphs separated.
        var halfHeight=(h-4*.35*90/81)/2;
        var stacked=Math.min(halfHeight/Math.max(bounds.getHeight(),peer.getHeight()),w/Math.max(bounds.getWidth(),peer.getWidth()));
        fit=Math.max(fit,stacked);
    }
    var scaleX=fit;
    var inkW=bounds.getWidth()*scaleX,inkH=bounds.getHeight()*fit;
    var blockW=w;
    var blockLeft=align==='right'?x-w:x;
    return {fit:fit,scaleX:scaleX,left:align==='right'?blockLeft+blockW-inkW:blockLeft,
        top:align==='right'?y+h-inkH:y,blockWidth:blockW};
}
function ymPairedTextLayout(bounds,peer,x,y,w,h,peerWidth,widthFactor,peerFactor){
    // Related labels use the same final font size and relative font baseline.
    var minY=Math.min(bounds.getY(),peer.getY()),maxY=Math.max(bounds.getMaxY(),peer.getMaxY());
    var fit=Math.min(h*.90/(maxY-minY),w/(bounds.getWidth()*widthFactor),peerWidth/(peer.getWidth()*peerFactor));
    var baseline=y+(h-(maxY-minY)*fit)/2-minY*fit;
    return {fit:fit,left:x,top:baseline+bounds.getY()*fit,baseline:baseline};
}
function ymServiceStackLayout(g,c,cached){
    var x=c.x*4,y=c.y*4,w=c.w*4,h=c.h*4,gap=h*c.serviceGapRatio;
    var placed=ymServicePairLayout(cached.bounds,cached.peer,x,y,w,h,'left',false,false);
    placed.bounds=cached.bounds;placed.outline=cached.outline;
    placed.top=y+(h-cached.bounds.getHeight()*placed.fit)/2;
    placed.clipX=x;placed.clipY=y;placed.clipW=w;placed.clipH=h;
    var transform=g.getTransform(),sx=transform.getScaleX(),sy=transform.getShearY();
    // Keep one physical texture pixel at each text edge. A barely fitting
    // outline can otherwise lose antialiased ink at the default 1024 width.
    var pixel=1/Math.max(.001,Math.sqrt(sx*sx+sy*sy));
    var joined=cached.joined,inkW=joined.bounds.getWidth()*placed.fit,inkH=joined.bounds.getHeight()*placed.fit;
    var span=2*h+gap,top=y-(c.serviceLine?h+gap:0);
    if(c.serviceGrowSingle){
        placed.fit=Math.min((w-2*pixel)/joined.bounds.getWidth(),(span-2*pixel)/joined.bounds.getHeight());
        placed.scaleX=placed.fit;inkW=joined.bounds.getWidth()*placed.fit;inkH=joined.bounds.getHeight()*placed.fit;
    }
    placed.merged=!!c.serviceGrowSingle||(!c.serviceKeepStack&&inkW+2*pixel<=w&&inkH+2*pixel<=span);
    // Special Rapid keeps one line for recognized case/compact aliases too.
    // Preserve its existing reference size when it fits; only shrink overflow.
    if(c.serviceForceSingle&&!placed.merged){
        placed.fit=Math.min(placed.fit,(w-2*pixel)/joined.bounds.getWidth(),(span-2*pixel)/joined.bounds.getHeight());
        placed.scaleX=placed.fit;inkW=joined.bounds.getWidth()*placed.fit;inkH=joined.bounds.getHeight()*placed.fit;
        placed.merged=true;
    }
    placed.skip=placed.merged&&c.serviceLine===1;
    if(placed.merged){
        placed.bounds=joined.bounds;placed.outline=joined.outline;
        placed.left=x+(w-inkW)/2;placed.top=top+(span-inkH)/2;
        placed.clipY=top;placed.clipH=span;
        if(c.inkBottom!==undefined){
            placed.top=c.inkBottom*4-inkH;
            placed.clipY=c.inkTop*4;placed.clipH=(c.inkBottom-c.inkTop)*4;
        }
    }
    return placed;
}
function ymRasterize(g,scene,font,fonts,transparentHousing){
    var Color=java.awt.Color,Font=java.awt.Font,Hint=java.awt.RenderingHints;
    g.setRenderingHint(Hint.KEY_ANTIALIASING,Hint.VALUE_ANTIALIAS_ON);
    g.setRenderingHint(Hint.KEY_TEXT_ANTIALIASING,Hint.VALUE_TEXT_ANTIALIAS_ON);
    g.setRenderingHint(Hint.KEY_FRACTIONALMETRICS,Hint.VALUE_FRACTIONALMETRICS_ON);
    g.setRenderingHint(Hint.KEY_RENDERING,Hint.VALUE_RENDER_QUALITY);
    var context=g.getFontRenderContext();
    if(!fonts._context||!fonts._context.equals(context)){
        fonts._context=context;fonts._glyphs=Object.create(null);fonts._glyphCount=0;fonts._head=null;fonts._tail=null;
    }
    for(var i=0;i<scene.length;i++){
        var c=scene[i],x=c.x*4,y=c.y*4,w=c.w*4,h=c.h*4,role=c.role||'label';
        if(c.kind==='marquee'){ymRasterNotice(g,c,font,fonts);continue;}
        if(transparentHousing&&c.kind==='rect'&&c.x===0&&c.y===0&&c.w===400&&c.h===100&&c.color===0x333333){
            // The number is printed over the 3-D casing; only its ink is opaque.
            var composite=g.getComposite();
            g.setComposite(java.awt.AlphaComposite.Clear);
            g.fillRect(0,0,1600,400);
            g.setComposite(composite);
            continue;
        }
        g.setColor(new Color(c.color));
        if(c.kind==='rect'){
            g.fill(new java.awt.geom.RoundRectangle2D.Double(x,y,w,h,c.radius*8,c.radius*8));
        }else{
            if(role==='approach'){
                var bandLeft=x-w/2,iconH=h*.86,iconW=iconH*.58;
                ymSoftTrainIcon(g,bandLeft+12,y+(h-iconH)/2,iconH,c.color);
                ymSoftTrainIcon(g,bandLeft+w-12-iconW,y+(h-iconH)/2,iconH,c.color);
                w-=2*(iconW+40);y+=h*.09;h*=.82;
                g.setColor(new Color(c.color));
            }
            // Approved B style: Bold text, with Medium clocks and compact badges.
            var medium=role==='clock'||role==='badge'||role==='car-count'||role==='car-unit',digits=role==='car-count'&&font.digits,key=String(h)+'/'+medium+'/'+!!digits;
            if(!fonts[key])fonts[key]=(digits?font.digits:medium?font.medium:font.bold).deriveFont(Font.PLAIN,h);
            var textPeer=c.headerPeer===undefined?c.destinationPeer:c.headerPeer;
            var glyphParts=[key,role,c.text,c.servicePeer===undefined?textPeer:c.servicePeer];
            if(c.serviceStack)glyphParts.push(c.serviceJoined);
            var glyphKey=JSON.stringify(glyphParts),cached=fonts._glyphs[glyphKey];
            if(!cached){
                cached=ymTrackedGlyph(fonts[key],context,c.text,h,role);
                if(c.servicePeer!==undefined)cached.peer=ymTrackedGlyph(fonts[key],context,c.servicePeer,h,role).bounds;
                if(c.serviceStack)cached.joined=ymTrackedGlyph(fonts[key],context,c.serviceJoined,h,role);
                if(textPeer)cached.matchedBounds=ymTrackedGlyph(fonts[key],context,textPeer,h,role).bounds;
                // Evict only the least recently used outline, retaining hot text.
                if(fonts._glyphCount>=128){
                    var oldest=fonts._head;fonts._head=oldest.next;
                    if(fonts._head)fonts._head.prev=null;else fonts._tail=null;
                    delete fonts._glyphs[oldest.key];oldest.next=null;fonts._glyphCount--;
                }
                cached.key=glyphKey;cached.prev=null;cached.next=null;
                fonts._glyphs[glyphKey]=cached;fonts._glyphCount++;
            }
            if(fonts._tail!==cached){
                if(cached.prev)cached.prev.next=cached.next;
                else if(fonts._head===cached)fonts._head=cached.next;
                if(cached.next)cached.next.prev=cached.prev;
                cached.prev=fonts._tail;cached.next=null;
                if(fonts._tail)fonts._tail.next=cached;else fonts._head=cached;
                fonts._tail=cached;
            }
            var bounds=cached.bounds;if(bounds.getWidth()<=0||bounds.getHeight()<=0)continue;
            // Match the approved slender clocks and slightly condensed Latin.
            // CJK keeps natural proportions; long text still fits its own box.
            var targetH=h*(c.serviceFill?1:role==='platform' ? .92 : role==='clock' ? .82 : .90);
            var widthFactor=role==='clock'?.94:(role==='label'&&/^[\x00-\x7F]+$/.test(c.text)?.92:1);
            var fit=Math.min(targetH/bounds.getHeight(),w/(bounds.getWidth()*widthFactor));
            var inkW=bounds.getWidth()*fit*widthFactor,inkH=bounds.getHeight()*fit;
            var left=c.align==='center'?x-inkW/2:c.align==='right'?x-inkW:x;
            var top=y+(h-inkH)/2;
            if(cached.matchedBounds&&cached.matchedBounds.getWidth()>0&&cached.matchedBounds.getHeight()>0){
                var peerWidth=c.headerPeerWidth===undefined?c.destinationPeerWidth:c.headerPeerWidth;
                var matched=ymPairedTextLayout(bounds,cached.matchedBounds,x,y,w,h,peerWidth*4,widthFactor,/^[\x00-\x7F]+$/.test(textPeer)?.92:1);
                fit=matched.fit;left=matched.left;top=matched.top;
            }
            var stack=null;
            if(c.serviceStack){
                stack=ymServiceStackLayout(g,c,cached);
                if(stack.skip)continue;
                fit=stack.fit;widthFactor=1;left=stack.left;top=stack.top;bounds=stack.bounds;
            }else if(cached.peer){
                var paired=ymServicePairLayout(bounds,cached.peer,x,y,w,h,c.align,c.serviceDiagonal,c.serviceFill);
                fit=paired.fit;widthFactor=paired.scaleX/fit;left=paired.left;top=paired.top;
            }
            if(c.inkCenter!==undefined&&!stack)top=c.inkCenter*4-bounds.getHeight()*fit/2;
            if(c.inkBottom!==undefined&&!stack)top=c.inkBottom*4-bounds.getHeight()*fit;
            var transform=g.getTransform(),clip=g.getClip();
            var boxLeft=c.align==='center'?x-w/2:c.align==='right'?x-w:x;
            var clipY=c.inkTop===undefined?y:c.inkTop*4;
            var clipH=c.inkBottom===undefined?h:(c.inkBottom-c.inkTop)*4;
            g.clip(new java.awt.geom.Rectangle2D.Double(stack?stack.clipX:boxLeft,stack?stack.clipY:clipY,stack?stack.clipW:w,stack?stack.clipH:clipH));
            g.translate(left-bounds.getX()*fit*widthFactor,top-bounds.getY()*fit);
            g.scale(fit*widthFactor,fit);g.fill(stack?stack.outline:cached.outline);
            g.setTransform(transform);g.setClip(clip);
        }
    }
}
function ymRasterCommand(c,width){
    var scale=width/400,left=c.x,top=c.y;
    if(c.kind!=='rect'&&c.kind!=='marquee')left-=c.align==='center'?c.w/2:c.align==='right'?c.w:0;
    // Two device pixels include antialiasing at clipped and rounded edges.
    // Either command can paint a joined label across the whole two-line band.
    var height=c.h;
    if(c.serviceStack){top-=c.serviceLine?c.h*(1+c.serviceGapRatio):0;height=c.h*(2+c.serviceGapRatio);}
    if(c.inkBottom!==undefined){top=c.inkTop;height=c.inkBottom-c.inkTop;}
    var x=Math.min(width,Math.max(0,Math.floor(left*scale)-2)),y=Math.min(width/4,Math.max(0,Math.floor(top*scale)-2));
    var right=Math.max(0,Math.min(width,Math.ceil((left+c.w)*scale)+2)),bottom=Math.max(0,Math.min(width/4,Math.ceil((top+height)*scale)+2));
    // Store the primitive drawing inputs, avoiding another JSON pass per command.
    var values=[c.kind,c.text,c.x,c.y,c.w,c.h,c.color,c.radius,c.align,c.bold,c.role,c.textHeight,c.travel,c.servicePeer,c.serviceDiagonal,c.headerPeer,c.headerPeerWidth,c.serviceFill,c.destinationField,c.destinationPeer,c.destinationPeerWidth,c.destinationHeld];
    if(c.serviceStack)values.push(c.serviceStack,c.serviceJoined,c.serviceLine,c.serviceGapRatio,c.serviceKeepStack,c.serviceGrowSingle,c.serviceForceSingle);
    values.push(c.inkTop,c.inkBottom,c.inkCenter);
    if(c.segments)for(var i=0;i<c.segments.length;i++)values.push(c.segments[i].text,c.segments[i].color);
    return {values:values,box:[x,y,Math.max(x,right),Math.max(y,bottom)]};
}
function ymSameRasterCommand(a,b){
    if(!a||!b||a.values.length!==b.values.length)return false;
    for(var i=0;i<a.values.length;i++)if(a.values[i]!==b.values[i])return false;
    return true;
}
function ymRasterDamage(previous,current,width){
    if(!previous)return null;
    var left=width,top=width/4,right=0,bottom=0;
    function include(entry){if(entry){var b=entry.box;left=Math.min(left,b[0]);top=Math.min(top,b[1]);right=Math.max(right,b[2]);bottom=Math.max(bottom,b[3]);}}
    for(var i=0;i<Math.max(previous.length,current.length);i++){
        if(ymSameRasterCommand(previous[i],current[i]))continue;
        include(previous[i]);include(current[i]);
    }
    var w=right-left,h=bottom-top;
    return w>0&&h>0&&w*h<width*width/4*.75?[left,top,w,h]:null;
}
function ymPaint(ctx,state,pids,scene){
    ymCreateRaster(state);
    var signature=JSON.stringify(scene),g=state.texture.graphics,transform=g.getTransform();
    var sameTransform=state.rasterTransform&&state.rasterTransform.equals(transform);
    if(signature!==state.lastScene||!sameTransform){
        var commands=scene.map(function(c){return ymRasterCommand(c,state.textureWidth);});
        var clip=g.getClip(),damage=sameTransform&&transform.isIdentity()&&clip===null?ymRasterDamage(state.rasterCommands,commands,state.textureWidth):null;
        try{
            if(damage)g.clipRect(damage[0],damage[1],damage[2],damage[3]);
            g.scale(state.textureWidth/1600,state.textureWidth/1600);
            var paintScene=damage?scene.filter(function(c,i){var b=commands[i].box;return b[0]<damage[0]+damage[2]&&b[2]>damage[0]&&b[1]<damage[1]+damage[3]&&b[3]>damage[1];}):scene;
            ymRasterize(g,paintScene,YM_FONT,state.fonts,state.roundedHousing);
        }finally{g.setTransform(transform);g.setClip(clip);}
        if(damage)state.texture.upload(damage[0],damage[1],damage[2],damage[3]);else state.texture.upload();
        state.lastScene=signature;state.rasterCommands=commands;state.rasterTransform=transform;
    }
    ymDrawRaster(ctx,state,pids);
}
// Back-view destination X, front-texture source X, width (400 logical units).
// Reorder whole regions without reversing the glyphs inside either region.
function ymBackSlices(side){
    // Keep the information panel whole; split only an empty edge of the number column.
    return side==='right'?[[0,322,6],[6,328,72],[78,0,322]]:
        [[0,78,322],[322,0,6],[328,6,72]];
}
function ymDrawRaster(ctx,state,pids){
    if(state.roundedHousing){ymDrawHousing(ctx,state,pids);return;}
    var width=Number(pids.width),height=Number(pids.height),id=state.texture.identifier;
    // JCM LIGHT_2 uses Minecraft's culled text layer. Opposite winding makes
    // each face visible only from its own side; keep all pieces coplanar.
    Texture.create().texture(id).size(width,height).zOrder(0).draw(ctx);
    var slices=ymBackSlices(state.platformSide||ymOption('platformSide'));
    for(var i=0;i<slices.length;i++){
        var part=slices[i];
        Texture.create().texture(id).pos(width*(400-part[0])/400,0)
            .size(-width*part[2]/400,height)
            .uv(part[1]/400,0,(part[1]+part[2])/400,1).zOrder(0).draw(ctx);
    }
}

