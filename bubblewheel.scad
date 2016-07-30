difference(){
    cylinder(1, 22, 22, $fn=100);
    for(a=[1:12]){        
        translate([18*cos(30*a), 18*sin(30*a), -0.01])
            cylinder(1.1, 3, 3, $fn=50);
        
    }
    translate([0, 0,-0.05])
    cylinder(1.1, .7, .7, $fn=20);
    
}