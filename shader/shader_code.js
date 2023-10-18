/* About
    This file is a collection of GLSL code as strings 
*/


// VERTEX SHADERS
const VERTEX_DEFAULT = `
varying vec2 vUv;
void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    gl_Position = projectionPosition;
    vUv = uv;
}
`;

// FRAGMENT SHADERS
/* Template
`
        uniform float u_time;
        uniform vec2 u_resolution;
        varying vec2 vUv; // uv coords?

        void main() {
            vec2 fragCoord = vUv * u_resolution;
            //vec2 uv = gl_FragCoord.xy / u_resolution;

            //...
        }
`
*/
const commonFragFields = `
uniform float u_time;
uniform vec2 u_resolution;
varying vec2 vUv;
`;

const FRAG_NetworkExploration = `
#define NUM_LAYERS 4.

uniform float u_time;
uniform vec2 u_resolution;
varying vec2 vUv;

float N21(vec2 p) {
	vec3 a = fract(vec3(p.xyx) * vec3(213.897, 653.453, 253.098));
    a += dot(a, a.yzx + 79.76);
    return fract((a.x + a.y) * a.z);
}

vec2 GetPos(vec2 id, vec2 offs, float t) {
    float n = N21(id+offs);
    float n1 = fract(n*10.);
    float n2 = fract(n*100.);
    float a = t+n;
    return offs + vec2(sin(a*n1), cos(a*n2))*.4;
}

float GetT(vec2 ro, vec2 rd, vec2 p) {
	return dot(p-ro, rd); 
}

float LineDist(vec3 a, vec3 b, vec3 p) {
	return length(cross(b-a, p-a))/length(p-a);
}

float df_line( in vec2 a, in vec2 b, in vec2 p)
{
    vec2 pa = p - a, ba = b - a;
	float h = clamp(dot(pa,ba) / dot(ba,ba), 0., 1.);	
	return length(pa - ba * h);
}

float line(vec2 a, vec2 b, vec2 uv) {
    float r1 = .04;
    float r2 = .01;
    
    float d = df_line(a, b, uv);
    float d2 = length(a-b);
    float fade = smoothstep(1.5, .5, d2);
    
    fade += smoothstep(.05, .02, abs(d2-.75));
    return smoothstep(r1, r2, d)*fade;
}

float NetLayer(vec2 st, float n, float t) {
    vec2 id = floor(st)+n;

    st = fract(st)-.5;
   
    vec2 p[9];
    int i=0;
    for(float y=-1.; y<=1.; y++) {
    	for(float x=-1.; x<=1.; x++) {
            p[i++] = GetPos(id, vec2(x,y), t);
    	}
    }
    
    float m = 0.;
    float sparkle = 0.;
    
    for(int i=0; i<9; i++) {
        m += line(p[4], p[i], st);

        float d = length(st-p[i]);

        float s = (.005/(d*d));
        s *= smoothstep(1., .7, d);
        float pulse = sin((fract(p[i].x)+fract(p[i].y)+t)*5.)*.4+.6;
        pulse = pow(pulse, 20.);

        s *= pulse;
        sparkle += s;
    }
    
    m += line(p[1], p[3], st);
	m += line(p[1], p[5], st);
    m += line(p[7], p[5], st);
    m += line(p[7], p[3], st);
    
    float sPhase = (sin(t+n)+sin(t*.1))*.25+.5;
    sPhase += pow(sin(t*.1)*.5+.5, 50.)*5.;
    m += sparkle*sPhase;//(*.5+.5);
    
    return m;
}

void main()
{
    vec2 fragCoord = vUv * u_resolution;
    vec2 uv = (fragCoord-u_resolution.xy*.5)/u_resolution.y;
    //vec2 uv = fragCoord.xy / u_resolution.xy;

    float t = u_time *.1;
    
    float s = sin(t);
    float c = cos(t);
    mat2 rot = mat2(c, -s, s, c);
    vec2 st = uv*rot;  
    
    float m = 0.;
    for(float i=0.; i<1.; i+=1./NUM_LAYERS) {
        float z = fract(t+i);
        float size = mix(15., 1., z);
        float fade = smoothstep(0., .6, z)*smoothstep(1., .8, z);
        
        m += fade * NetLayer(st*size, i, u_time);
    }
   
    vec3 baseCol = vec3(s, cos(t*.4), -sin(t*.24))*.4+.6;
    vec3 col = baseCol*m;
    
    #ifdef SIMPLE
    uv *= 10.;
    col = vec3(1)*NetLayer(uv, 0., u_time);
    uv = fract(uv);
    //if(uv.x>.98 || uv.y>.98) col += 1.;
    #else
    col *= 1.-dot(uv,uv);
    t = mod(u_time, 230.);
    col *= smoothstep(0., 20., t)*smoothstep(224., 200., t);
    #endif

    // TIME TO DARKEN
    col *= 0.225;
    
    gl_FragColor = vec4(col,1);
}
`;

const FRAG_ParticleNetwork1 = `
uniform float u_time;
uniform vec2 u_resolution;
varying vec2 vUv;

const int number_of_particles = 250;
const int number_of_buckets = 32;
const float brightness_particle = -50000.0;
const float brightness_wire = -500.0;
const float cutoff = 0.01;
const float speed = 0.04;
const float time_offset = 999.0;
const vec3 color = vec3(-0.3, -0.3, -0.3);

const int half_of_buckets = number_of_buckets / 2;
const float bucket_angle_ratio = float(half_of_buckets) / 3.14159265359;

const float angle = 1.2;
const mat2 rotate = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

float ring[number_of_buckets];

void main() {
    vec2 fragCoord = vUv * u_resolution;

    float average_resolution = 0.5 * (u_resolution.x + u_resolution.y);
    vec2 pole = fragCoord / average_resolution - 0.5;
    vec2 particle = vec2(speed * (time_offset + u_time), 0);
    float brightness = 0.0;
    
    for (int i = 0; i < number_of_particles; i++)
    {
        vec2 partial_wire = fract((particle *= rotate) - pole) - 0.5;
        float radius = dot(partial_wire, partial_wire);
        
        if (radius < cutoff)
        {
            float radial_brightness = exp(radius * brightness_wire);
            float bucket = bucket_angle_ratio * (atan(partial_wire.y, partial_wire.x) + 7.0);
            float leaking_brightness = radial_brightness * fract(bucket);
            int b = int(bucket);
            
            ring[b % number_of_buckets] += radial_brightness - leaking_brightness;
            ring[(b+1) % number_of_buckets] += leaking_brightness;

            brightness += exp(radius * brightness_particle);
        }
    }

    for (int i = 0; i < half_of_buckets; i++)
    {
        brightness += ring[i] * ring[i + half_of_buckets];
    }

    gl_FragColor = vec4(color + brightness, 1.0);
}
`;

const FRAG_LightLanes = `
uniform float u_time;
uniform vec2 u_resolution;
varying vec2 vUv;

float aaStep( float fun){return smoothstep( min(fwidth(fun),.001), .0, fun);} //simple antialiasing

float hash21(vec2 p){ //pseudorandom generator, see The Art of Code on youtu.be/rvDo9LvfoVE
    p = fract(p*vec2(13.81, 741.76));
    p += dot(p, p+42.23);
    return fract(p.x*p.y);
}

void main() {
    vec2 fragCoord = vUv * u_resolution;

    vec2 uv = (2.*fragCoord-u_resolution.xy) / max(u_resolution.x, u_resolution.y); //long edge -1 to 1, square aspect ratio
    float amp = 0.;
	float delY = .1;
	float r, ox, fun;
    
	for (float m=-1.;m<=1.;m+=.05){
		ox = m;
		fun = uv.x-ox;
		for (float n=0.;n<2./delY;n++){ //uv.y -1..1
			r = floor(hash21(vec2(n+ceil(u_time/15.),ox+max(.98,fract(u_time/15.))))*3.-1.); //r {-1,0,1}
            fun += (r*(uv.y-(delY*n-1.))+ox+m) * step(delY*n-1.,uv.y+.001) * step(uv.y+.001,delY*(n+1.)-1.); //+.001 to avoid weird? singularities for negative uv.y
            ox = r*(delY*(n+1.)-1.) - (r*(delY*n-1.)-ox-m) - m; //? isnt that supposed to be: ox += r*delY ?
		}
		amp += aaStep(abs(fun)-.004*u_resolution.y/u_resolution.x) * (.1+.9*aaStep(abs(fragCoord.y/u_resolution.y-fract(u_time/8.+m))-.005*u_resolution.y/u_resolution.x));
	} 

    gl_FragColor = vec4(vec3(amp),1);
}
`;


export { VERTEX_DEFAULT, FRAG_NetworkExploration, FRAG_ParticleNetwork1, FRAG_LightLanes };