


var elems = document.getElementsByClassName("item");
var waiting = false;

for (var i=0; i<elems.length; i++) {
    
    elems[i].addEventListener('click', click_plant, false);
}



/* PROGRESS RING */
class ProgressRing extends HTMLElement {
    constructor() {
      super();
      const stroke = 4;this.getAttribute('stroke');
      const radius = 60;this.getAttribute('radius');
      const normalizedRadius = radius - stroke * 2;
      this._circumference = normalizedRadius * 2 * Math.PI;
  
      this._root = this.attachShadow({mode: 'open'});
      this._root.innerHTML = `
        <svg
          height="${radius * 2}"
          width="${radius * 2}"
         >
           <circle
             stroke="#90ee90"
             stroke-dasharray="${this._circumference} ${this._circumference}"
             style="stroke-dashoffset:${this._circumference}"
             stroke-width="${stroke}"
             fill="transparent"
             r="${normalizedRadius}"
             cx="${radius}"
             cy="${radius}"
          />
        </svg>
  
        <style>
          circle {
            transition: stroke-dashoffset 0.35s;
            transform: rotate(-90deg);
            transform-origin: 50% 50%;
          }
        </style>
      `;
    }
    
    setProgress(percent) {
      const offset = this._circumference - (percent / 100 * this._circumference);
      const circle = this._root.querySelector('circle');
      circle.style.strokeDashoffset = offset; 
    }
  
    static get observedAttributes() {
      return ['progress'];
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'progress') {
        this.setProgress(newValue);
      }
    }
  }
  
  window.customElements.define('progress-ring', ProgressRing);
  
/* PROGRESS RING END */

function click_plant(e) {
    if (e.target.classList.contains("plant")) {
        
        if(!e.target.classList.contains("info")) {
            
            e.target.innerHTML = "";            

            var span = document.createElement("SPAN");   
            span.innerHTML = "plant info";               
            e.target.appendChild(span);               


        }
        else {
            e.target.innerHTML = '🌱';
        }
        e.target.classList.toggle("info");

    }
    else if (!waiting){
        waiting = true;
        e.target.classList.add("plant");

        var target_grid = e.target.classList[1];

        
        var ring = new ProgressRing();
        //ring.setAttributeNS(null, "stroke", "4");
        //ring.setAttributeNS(null, "radius", "60");
        //ring.setAttributeNS(null, "progress", "50");
        e.target.appendChild(ring);


        /* RING BULLSHIT */
        
  
        // emulate progress attribute change
        
        let progress = 0;
        const el = document.querySelector('progress-ring');

        const interval = setInterval(() => {
          progress += 10;
          el.setAttribute('progress', progress);
          if (progress === 100) {
            clearInterval(interval);
            e.target.innerHTML = '🌱';
            waiting = false;
          }
        }, 400);


        //waiting = false;
        //e.target.innerHTML = '';
        //e.target.innerHTML = '🌱'; 
        
        //e.target.innerHTML = '⏰';
        /*
        timeout = setTimeout(function() {
            e.target.innerHTML = '🌱';
            waiting = false;
            }, 5000);
        }
        */

    }
}


