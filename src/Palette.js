
/*
 A Palette object includes a getColor method that, when passed a value, returns an rgb style string. When called with the same value - so long as it is of a
 kind for which the === operator works - it will always return the same color. 
 
 The Palette constructor also accepts three optional arguments:
 - palette (in the form of an array of arrays of rgb values) - the default comprises 12 compatible colors 
 - colorsTooClosePred - this is a function that is used to determine whether a color randomly generated (after the palette is exhausted) is acceptably
 different from those colors already used 
 - retFn - this function takes an array of r, g, b and transforms it, by default to a string usable in CSS
 
 p = new Palette();
 p.getColor("coup");  // "rgb(141,211,199)"
 p.getColor(45);      // "rgb(255,255,179)"
 p.getColor("coup");  // "rgb(141,211,199)"
 p2 = new Palette([[14, 200, 36], [45, 130, 120]])
 p2.getColor("a")     // "rgb(14,200,36)"
 p2.getColor({eventType: 'violent', source: 'news'}) // "rgb(45,130,120)"
 p2.getColor({eventType: 'violent', source: 'news'}) // "rgb(45,130,120)"
 p2.getColor("coup")  // "rgb(27,232,243)"
 
 N.B. As the number of assigned colors increases, the generation of new colors that don't collide with existing colors will get slower and slower - and, 
 eventually, result in an infinite loop. This should not become a real problem until long, long after one is using more colors than anyone can distinguish. 
 But, be careful.
 
 */
!function(scope){
    'use strict';
    
    function Palette(palette, colorsTooClosePred, retFn) {
        
        this.palette = palette || [[141, 211, 199], [255, 255, 179], [190, 186, 218], [251, 128, 114], [128, 177, 211], [253, 180, 98], [179, 222, 105], [252, 205, 229], [217, 217, 217], [188, 128, 189], [204, 235, 197], [255, 237, 111]];
        
        this.colorsTooClosePred = colorsTooClosePred || function(rgb1, rgb2) { return Palette.rgbDistance(rgb1, rgb2) < 20; } 
        
        this.retFn = retFn || Palette.toCSS
        
        this.colorsAssigned = {};
        
        return this;
    }
    
    Palette.rgbEqual = function(rgb1, rgb2) {
        return rgb1[0] === rgb2[0] && rgb1[1] === rgb2[1] && rgb1[2] === rgb2[2];
    }
    
    Palette.rgbDistance = function(rgb1, rgb2) {
        return Math.sqrt(Math.pow(rgb1[0] - rgb2[0], 2) + Math.pow(rgb1[1] - rgb2[1], 2) + Math.pow(rgb1[2] - rgb2[2], 2));
    }
    
    Palette.toCSS = function(rgb) { 
        return "rgb(" + rgb.join(",") + ")"; 
    }
    
    Palette.prototype.getColor = function(itemType) {
        if(!this.colorsAssigned.hasOwnProperty(itemType)) {
            var nextFromPalette = this.palette.shift();
            if(typeof nextFromPalette !== 'undefined') {
                this.colorsAssigned[itemType] = nextFromPalette;
            } else {
                do {
                    var rgb = [Math.floor((Math.random()*256)), Math.floor((Math.random()*256)), Math.floor((Math.random()*256))];
                } while(objSome(this.colorsAssigned, this.colorsTooClosePred.bind(null, rgb)));
                this.colorsAssigned[itemType] = rgb;
            }
        }
        return this.retFn(this.colorsAssigned[itemType]);
    }
    
    function objSome(obj, pred) {
        for(var i in obj) {
            if(obj.hasOwnProperty(i) && pred(i, obj[i])) return true;
        }
        return false;
    }
    
    scope.Palette = Palette;
    
}(window);
