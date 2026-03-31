// ==========================
// 🌌 GALAXIA THREE.JS
// ==========================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({canvas: document.getElementById("bg"), antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));

const isMobile = window.innerWidth < 768;

const parameters = { 
    count: isMobile ? 6000 : 12000,
    size: 0.02,
    radius: 5,
    branches: 5,
    spin: 1,
    randomness: 0.3
};
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(parameters.count*3);
const colors = new Float32Array(parameters.count*3);
const colorInside = new THREE.Color("#ff6ec7");
const colorOutside = new THREE.Color("#6a5acd");

for(let i=0;i<parameters.count;i++){
    const i3=i*3;
    const radius=Math.random()*parameters.radius;
    const spinAngle=radius*parameters.spin;
    const branchAngle=(i%parameters.branches)/parameters.branches*Math.PI*2;
    const randomX=Math.pow(Math.random(),3)*(Math.random()<0.5?1:-1)*parameters.randomness;
    const randomY=Math.pow(Math.random(),3)*(Math.random()<0.5?1:-1)*parameters.randomness;
    const randomZ=Math.pow(Math.random(),3)*(Math.random()<0.5?1:-1)*parameters.randomness;
    positions[i3]=Math.cos(branchAngle+spinAngle)*radius+randomX;
    positions[i3+1]=randomY;
    positions[i3+2]=Math.sin(branchAngle+spinAngle)*radius+randomZ;
    const mixedColor=colorInside.clone();
    mixedColor.lerp(colorOutside,radius/parameters.radius);
    colors[i3]=mixedColor.r; colors[i3+1]=mixedColor.g; colors[i3+2]=mixedColor.b;
}

geometry.setAttribute("position",new THREE.BufferAttribute(positions,3));
geometry.setAttribute("color",new THREE.BufferAttribute(colors,3));

const material=new THREE.PointsMaterial({
    size:parameters.size,
    vertexColors:true,
    blending:THREE.AdditiveBlending,
    depthWrite:false
});

const galaxy=new THREE.Points(geometry,material);
scene.add(galaxy);

galaxy.rotation.x=Math.PI/3.5;
galaxy.rotation.y=Math.PI/6;
camera.position.z=8;
camera.position.y=0.5;

// ==========================
// 🌠 ESTRELLAS FUGACES
// ==========================
const shootingStars = [];

for (let i = 0; i < 15; i++) {
    const starGeo = new THREE.BufferGeometry();
    const starMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.25 + Math.random() * 0.15,
        transparent: true,
        opacity: 0.9
    });

    const starPos = new Float32Array(3);
    starPos[0] = (Math.random() - 0.5) * 50;
    starPos[1] = (Math.random() - 0.5) * 50;
    starPos[2] = (Math.random() - 0.5) * 50;

    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));

    const star = new THREE.Points(starGeo, starMat);
    star.userData = {
        speed: 0.10 + Math.random() * 0.2,
        direction: Math.random() < 0.5 ? 1 : -1
    };

    scene.add(star);
    shootingStars.push(star);
}

function animateShootingStars() {
    shootingStars.forEach(star => {
        const pos = star.geometry.attributes.position.array;
        pos[1] += star.userData.speed * star.userData.direction;
        if (pos[1] > 25) pos[1] = -25;
        if (pos[1] < -25) pos[1] = 25;
        star.geometry.attributes.position.needsUpdate = true;
    });
}

// ==========================
// 🎮 INTERACCIÓN CÁMARA
// ==========================
let targetX=0,targetY=0,currentX=0,currentY=0;

document.addEventListener("mousemove",(e)=>{
    targetX=(e.clientX/window.innerWidth-0.5);
    targetY=(e.clientY/window.innerHeight-0.5);
});

document.addEventListener("touchmove",(e)=>{
    targetX=(e.touches[0].clientX/window.innerWidth-0.5);
    targetY=(e.touches[0].clientY/window.innerHeight-0.5);
});

let zoomTarget=6,zoomCurrent=6,searching=false;


let animar = true;
let velocidad = 1; // 🔥 nueva

function animate(){

    if(!animar) return; // 🔥 aquí se detiene todo

    requestAnimationFrame(animate);

    const time = Date.now() * 0.0003;

    galaxy.rotation.y += 0.0008;
    galaxy.position.y = Math.sin(time) * 0.2;

    if(searching) galaxy.rotation.z+=0.005;

    currentX+=(targetX-currentX)*0.03;
    currentY+=(targetY-currentY)*0.03;

    camera.position.x=currentX*2;
    camera.position.y=-currentY*2;
    camera.lookAt(0,0,0);

    zoomCurrent+=(zoomTarget-zoomCurrent)*0.03;
    camera.position.z=zoomCurrent;

    shootingStars.forEach(star=>{
        star.position.x+=star.userData.speed;
        if(star.position.x>25){
            star.position.x=-25;
            star.position.y=(Math.random()-0.5)*50;
            star.position.z=(Math.random()-0.5)*50;
        }
    });

    renderer.render(scene,camera);
    animateShootingStars();
}
animate();

window.addEventListener("resize",()=>{
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
});

// ==========================
// 🔊 AUDIO INTELIGENTE
// ==========================
const spaceSound=document.getElementById("spaceSound");
let audioIniciado = false;

function iniciarAudio() {
    if (audioIniciado) return;

    spaceSound.volume = 0.4;

    const playPromise = spaceSound.play();

    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                audioIniciado = true;
            })
            .catch(() => {});
    }
}

// Auto intento
window.addEventListener("load", () => {
    setTimeout(() => {
        iniciarAudio();
    }, 1200);
});

// Movimiento
document.addEventListener("mousemove", () => {
    iniciarAudio();
}, { once: true });

// Touch
document.addEventListener("touchstart", () => {
    iniciarAudio();
}, { once: true });

// ==========================
// 👆 HUELLA
// ==========================
const fingerprint=document.getElementById("fingerprint");
const scan=document.querySelector(".scan");

let holding=false;
let timer;

fingerprint.addEventListener("mousedown",startScan);
fingerprint.addEventListener("touchstart",startScan);
fingerprint.addEventListener("mouseup",cancelScan);
fingerprint.addEventListener("mouseleave",cancelScan);
fingerprint.addEventListener("touchend",cancelScan);

function startScan(){
    holding = true;
    scan.style.height = "100%";

    iniciarAudio(); // 🔥 respaldo

    // 📳 VIBRACIÓN (solo si el dispositivo lo soporta)
    if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100]);
}

    timer = setTimeout(() => {
        if (holding) iniciarSistema();
    }, 1200);
}

function cancelScan(){
    holding=false;
    scan.style.height="0%";
    clearTimeout(timer);
}

// ==========================
// 🧠 SISTEMA
// ==========================
const systemText=document.getElementById("systemText");
const loadingBar=document.getElementById("loadingBar");
const loadingPercent=document.getElementById("loadingPercent");

const searchLines=[
    "Conectando con red interestelar...",
    "Buscando señal en el universo...",
    "Analizando galaxia...",
    "Detectando actividad...",
    "Señal encontrada...",
    "Usuario localizado..."
];

let step=0;
let percent=0;

function ejecutarBusqueda(){
    if(step<searchLines.length){
        typeLine(searchLines[step],0,()=>{ 
            step++;
            percent+=Math.floor(100/searchLines.length);
            if(percent>100) percent=100;

            loadingBar.style.width=percent+"%";
            loadingPercent.innerText=percent+"%";

            zoomTarget=3+Math.random()*2;

            setTimeout(ejecutarBusqueda,500);
        });
    }else{
        loadingBar.style.width="100%";
        loadingPercent.innerText="100%";
        setTimeout(mostrarPerfil,500);
    }
}

function typeLine(text,index,callback){
    if(index<text.length){
        systemText.innerHTML+=text.charAt(index);
        setTimeout(()=>typeLine(text,index+1,callback),50);
    }else{
        systemText.innerHTML+="<br>";
        callback();
    }
}

function iniciarSistema(){
    document.getElementById("screen1").classList.remove("active");
    document.getElementById("screen2").classList.add("active");

    searching=true;

    spaceSound.play(); // respaldo

    ejecutarBusqueda();
}

// ==========================
// 👤 PERFIL
// ==========================
function mostrarPerfil(){
    document.getElementById("screen2").innerHTML=`
        <h2 class="fade">Usuario encontrado</h2>

        <div class="profile-wrapper">
            <img src="https://scontent-bog2-1.xx.fbcdn.net/v/t39.30808-6/492511304_1233925081684468_5192735296131005511_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=1d70fc&_nc_eui2=AeERd7JmtrWnHUqpu73jiUKsM_wUQJbLOyMz_BRAlss7I3V2Z2fwDn9ksyR9RBA2sNuOUxEKPTloh9_9R1eaUJJC&_nc_ohc=yhpwem5uhYEQ7kNvwG_l9xl&_nc_oc=AdoDahsVWNmDer9t0jeb8wH0FfO_q2dHfg3nEB57oWlRSsAhdpUy6tTXHLtcaM-6QLXsw6n-FxYgvUx4gKlpgHuf&_nc_zt=23&_nc_ht=scontent-bog2-1.xx&_nc_gid=6_VGL1KXNncPGRjbj08-Cw&_nc_ss=7a3a8&oh=00_AfwbClTJiT_zCtrOQKIUgcPaMCGljgMuMMa1kCxFApkn8A&oe=69D10811" class="profile"></img>
            <div class="scan-line"></div>
        </div>

        <h3 class="typing">Yenifer Rodriguez</h3>
        <p class="typing delay1">Estado: Desaparecida recientemente 😅</p>
        <p class="typing delay2">Última conexión: hace mucho...</p>

        <button onclick="continuar()">Intentar reconexión</button>
    `;
}

function continuar(){

    
    animar = false; // 🔥 DETIENE LA GALAXIA SOLO AQUÍ

    const screen = document.getElementById("screen2");

    // 🔻 BAJAR CALIDAD PARA MÓVIL
if(window.innerWidth < 768){
    renderer.setPixelRatio(1); // 🔥 menos carga
}

    // Animación de salida
    screen.style.transition = "0.6s";
    screen.style.opacity = "0";

    setTimeout(() => {

        // Nueva pantalla
        screen.innerHTML = `
            <div class="reconnect-screen">
                
                <h2 class="fade">Analizando causa de desconexión...</h2>

                <input type="text" placeholder="Escribe una posible razón..." class="input-reason">

                <button onclick="finalizar()">Intentar reconexión </button>

                <div class="floating-words">
                    <span>Ocupada</span>
                    <span>Desinteres</span>
                    <span>Trabajo</span>
                    <span>Problemas</span>
                    <span>Cansancio</span>
                    <span>Estrés</span>
                    <span>Olvido</span>
                    <span>Molesta</span>
                    <span>Intensidad</span>
                </div>

            </div>
        `;

        screen.style.opacity = "1";

    }, 600);
}

function finalizar(){
    
    
animar = true;
    animate(); // 🔥 vuelve la galaxia

    const input = document.querySelector(".input-reason");
    const respuesta = input.value;

    if(respuesta.trim() === ""){
        alert("Escribe algo 😅");
        return;
    }

    // ✅ GUARDAR EN GOOGLE FORMS
    fetch("https://docs.google.com/forms/d/e/1FAIpQLSduJ8qxUPm0u0p3k8S-9nnYYXNKvqSg9NRin49AEWpqcqpAlg/formResponse", {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "entry.86457370=" + encodeURIComponent(respuesta)
    });

    const screen = document.getElementById("screen2");

    // 🎬 PANTALLA DE PROCESO
    screen.innerHTML = `
        <h2 id="textoProceso"></h2>

        <div id="loadingBarContainer">
            <div id="loadingBar"></div>
            <p id="loadingPercent">0%</p>
        </div>
    `;

    // 🔥 TEXTO ANIMADO (AQUÍ VA)
    const texto = document.getElementById("textoProceso");

    const mensajes = [
        "Iniciando análisis...",
        "Interpretando señales emocionales...",
        "Buscando conexión...",
        "Sincronizando datos...",
        "Evaluando probabilidad..."
    ];

    let i = 0;

    function cambiarMensajes(){
        if(i < mensajes.length){
            escribirTexto(texto, mensajes[i], 30, () => {
                i++;
                setTimeout(cambiarMensajes, 500);
            });
        }
    }

    cambiarMensajes();

    // 🔥 BARRA DE CARGA
    let percent = 0;

    const interval = setInterval(() => {
        percent++;

        document.getElementById("loadingBar").style.width = percent + "%";
        document.getElementById("loadingPercent").innerText = percent + "%";

        if(percent >= 85){
            clearInterval(interval);

            setTimeout(() => {
                mostrarDecision();
            }, 1000);
        }

    }, 40);
}
    function mostrarDecision(){
    const screen = document.getElementById("screen2");

    screen.innerHTML = `
       <h2 class="glitch">⚠ Conexión inestable</h2>

    <p class="fade">
    No se ha podido establecer una conexión completa...
    </p>

    <p class="fade delay">
    El resultado ahora depende de ti.
</p>
        <div id="loadingBarContainer" style="margin-top:20px;">
            <div id="loadingBar" style="width:85%"></div>
        </div>

        <div style="margin-top:30px; position:relative; height:150px;">
            <button onclick="subirProbabilidad()">💯+15%</button>
            <button id="btnCero" onmouseover="moverBoton()" style="position:absolute;">
                💀-85%
            </button>
        </div>
    `;
}
function subirProbabilidad(){
    let bar = document.getElementById("loadingBar");
    let width = 85;

    const interval = setInterval(() => {
        width++;
        bar.style.width = width + "%";

     if(width >= 100){
    clearInterval(interval);

    setTimeout(() => {
        mostrarConexionFinal();
    }, 800);
}

    }, 40);
}
function moverBoton(){
    const btn = document.getElementById("btnCero");

    const x = Math.random() * 80;
    const y = Math.random() * 80;

    btn.style.left = x + "%";
    btn.style.top = y + "%";

    // 💥 efecto vibración
    btn.style.transform = `translate(${Math.random()*10-5}px, ${Math.random()*10-5}px)`;
}
document.addEventListener("mousemove", (e) => {
    const btn = document.getElementById("btnCero");
    if(!btn) return;

    const rect = btn.getBoundingClientRect();

    const distancia = Math.hypot(
        e.clientX - (rect.left + rect.width/2),
        e.clientY - (rect.top + rect.height/2)
    );

    // 😈 si se acerca... HUYE
    if(distancia < 120){
        moverBoton();
    }
});
document.addEventListener("click", (e) => {
    const btn = document.getElementById("btnCero");
    if(!btn) return;

    const rect = btn.getBoundingClientRect();

    if(
        e.clientX > rect.left &&
        e.clientX < rect.right &&
        e.clientY > rect.top &&
        e.clientY < rect.bottom
    ){
        moverBoton();
    }
});
function escribirTexto(elemento, texto, velocidad = 40, callback){
    elemento.innerHTML = "";
    let i = 0;

    function escribir(){
        if(i < texto.length){
            elemento.innerHTML += texto.charAt(i);
            i++;
            setTimeout(escribir, velocidad);
        } else if(callback){
            callback();
        }
    }

    escribir();
}

function mostrarConexionFinal(){

    const screen = document.getElementById("screen2");

    screen.innerHTML = `
        <div class="final-screen">

            <h2 class="success-text">✔ Conexión 100% exitosa</h2>

            <div class="connection-container">

                <!-- ELLA -->
                <div class="profile-box">
                   <img src="https://scontent-bog2-1.xx.fbcdn.net/v/t39.30808-6/492511304_1233925081684468_5192735296131005511_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=1d70fc&_nc_eui2=AeERd7JmtrWnHUqpu73jiUKsM_wUQJbLOyMz_BRAlss7I3V2Z2fwDn9ksyR9RBA2sNuOUxEKPTloh9_9R1eaUJJC&_nc_ohc=yhpwem5uhYEQ7kNvwG_l9xl&_nc_oc=AdoDahsVWNmDer9t0jeb8wH0FfO_q2dHfg3nEB57oWlRSsAhdpUy6tTXHLtcaM-6QLXsw6n-FxYgvUx4gKlpgHuf&_nc_zt=23&_nc_ht=scontent-bog2-1.xx&_nc_gid=tvF0jaJLMsSeSgno0ug_rw&_nc_ss=7a3a8&oh=00_AfzuRgcLWFlLCoeD7CXn-X1f20FL4tGCqZ9HbNIop8XYXA&oe=69D14051" class="profile-small">
                    <p class="status online">🟢 Activa</p>
                    <h3>Yenifer</h3>
                </div>

                <!-- LÍNEA -->
                <div class="connection-line"></div>

                <!-- TÚ -->
                <div class="profile-box">
                     <img src="https://scontent-bog2-1.xx.fbcdn.net/v/t39.30808-6/481186127_2122892528147614_6875421346686273512_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=1d70fc&_nc_eui2=AeEF7OLaQ9tws4MJRu7mUDrM0zuABClKtJfTO4AEKUq0l4nNNYVxId6nRvyOQcUw5SxH_Jud0Aquq9JlpNSRqiha&_nc_ohc=J2pCBaU7byIQ7kNvwFYS4u1&_nc_oc=Adp37qeNqcmHuYjAetMXssNvTrGv9dKsadG_Q09lt0MKmA9LNMFvuhjDPzHKdg7HyfIW7vnb4C6xw3u2hFi5askL&_nc_zt=23&_nc_ht=scontent-bog2-1.xx&_nc_gid=AGXnuuX9owY21eIqrvwjQg&_nc_ss=7a3a8&oh=00_AfyeGmeUivEjaUS2dTqan3xQjiJScG7--0k10bS9VsaUVQ&oe=69D16BAA" class="profile-small">
                    <p class="status online">🟢 Activo</p>
                    <h3>Stiben aldana </h3>
                </div>

            </div>

            <div class="buttons">
                <button onclick="enviarWhatsApp()">Enviar mensaje 💬</button>
                <button class="btn-troll" id="btnNo">Ignorar ❌</button>
            </div>

        </div>
    `;

    // 🔥 BOTÓN QUE SE ESCAPA
    const btnNo = document.getElementById("btnNo");

    btnNo.addEventListener("mouseover", () => {
        const x = Math.random() * 300 - 150;
        const y = Math.random() * 200 - 100;
        btnNo.style.transform = `translate(${x}px, ${y}px)`;
    });
}
function enviarWhatsApp(){

    const numero = "573215846854";
    const mensaje = "Hola... parece que la conexión nunca se perdió 😏";

    const fade = document.getElementById("fadeBlack");

    // 🌑 DESVANECER SUAVE
    fade.style.opacity = "0.8"; // 🔥 no totalmente negro

    // 🔇 BAJAR AUDIO
    let volumen = spaceSound.volume;

    const bajarAudio = setInterval(() => {
        volumen -= 0.03;

        if(volumen <= 0){
            volumen = 0;
            clearInterval(bajarAudio);
            spaceSound.pause();
        }

        spaceSound.volume = volumen;
    }, 100);

    // ✨ MENSAJE ENCIMA (SIN BORRAR TODO)
    setTimeout(() => {

        const mensajeFinal = document.createElement("div");

        mensajeFinal.innerHTML = `
            <h2>✨ Fin de la conexión...</h2>
            <p>A veces, solo hay que intentarlo...</p>
        `;

        mensajeFinal.style.position = "fixed";
        mensajeFinal.style.top = "50%";
        mensajeFinal.style.left = "50%";
        mensajeFinal.style.transform = "translate(-50%, -50%)";
        mensajeFinal.style.color = "white";
        mensajeFinal.style.textAlign = "center";
        mensajeFinal.style.zIndex = "1000";
        mensajeFinal.style.opacity = "0";
        mensajeFinal.style.transition = "opacity 2s";

        document.body.appendChild(mensajeFinal);

        // 💫 aparece suave
        setTimeout(() => {
            mensajeFinal.style.opacity = "1";
        }, 100);

    }, 1500);

    // ⏳ ESPERA PARA QUE LEA
    setTimeout(() => {
        window.open(
            `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`,
            "_blank",
            "noopener"
        );
    }, 4500); // 🔥 aquí controlas cuánto dura
}