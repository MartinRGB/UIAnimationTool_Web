var poly = document.querySelector('.graph_bezierline');
var pathEl = document.querySelector('.curve');
var presetsEls = document.querySelectorAll('.options button');

var RATIO_SMALL = 0.8;
var RATIO_BIG = 1.5;
var ratio = window.innerWidth >= 980 ? RATIO_BIG : RATIO_SMALL;
// var ratio = RATIO_SMALL;


var currentTarget;
var startFrame = 0;

var barSize = 200 * ratio;
var lineWidth = 2;
var points,smoothLine;
var chartSize = barSize / (2*ratio);

var transTime = 1000;
var delayTime = 0;
var androidDeafultFactor = 2.0;
var stiffnessDeafultFactor = 1500;
var startDefaultVelocity = 1500;

// -------  Add Timeline  -------

var timeline = anime.timeline({
  loop: false,
  androidFactors: androidDeafultFactor,
  stiffnessFactors:stiffnessDeafultFactor,
  startVelocity:startDefaultVelocity
});

function animateProgress(easingName) {

  timeline.pause();

  timeline = anime.timeline({
    loop: false,
    androidFactors: androidDeafultFactor,
    stiffnessFactors:stiffnessDeafultFactor,
    startVelocity:startDefaultVelocity
  });

  timeline.add([
    {
      targets: '.axis.x',
      translateX: { value: [0, (200 * ratio)], delay: delayTime, duration: transTime },
      easing: 'linear',
      offset: 0
    }, {
      targets: '.axis.y',
      translateY: { value: [0, -(200 * ratio)], delay: delayTime, duration: transTime, easing: easingName },
      easing: 'linear',
      offset: 0,
      update: function(anim) {
        points.push([anim.timeProgress, isNaN(anim.valueProgress)? 0 : -anim.valueProgress]);
        //console.log(anim.valueProgress)
        poly.setAttribute('points',points);
        startFrame++;
      },
      complete: function(anim) {
        smoothLine = smooth(smooth(smooth(smooth(points))));
        poly.setAttribute('points',smoothLine);
      }
    }, {
      targets: '.ball',
      translateY: { value: [0, -100], delay: delayTime, duration: transTime, easing: easingName },
      offset: 0
    }
  ]);

}




// -------  Event  -------

window.onresize = resize;
window.onload = init;

function init(){
  presetsEls[0].click();
  pathEl.setAttribute('d', getCoordinates(presetsEls[0].value));
}


function resize()
{
  if(window.innerWidth <= 980 && ratio != RATIO_SMALL){
    ratio = RATIO_SMALL;
    var originalTransX = document.getElementById('axix_x').style.transform.replace(/[^\d.]/g, '');
    var originalTransY = document.getElementById('axix_y').style.transform.replace(/[^\d.]/g, '');
    document.getElementById('axix_y').style["transform"] = 'translateY(' - originalTransY/RATIO_BIG*RATIO_SMALL + 'px)';
    document.getElementById('axix_x').style["transform"] = 'translateX(' + originalTransX/RATIO_BIG*RATIO_SMALL + 'px)';
  }
  else if(window.innerWidth > 980 && ratio != RATIO_BIG){
    ratio = RATIO_BIG;
    var originalTransX = document.getElementById('axix_x').style.transform.replace(/[^\d.]/g, '');
    var originalTransY = document.getElementById('axix_y').style.transform.replace(/[^\d.]/g, '');
    console.log(originalTransY);
    document.getElementById('axix_x').style.transform = 'translateX(' + originalTransX*RATIO_BIG/RATIO_SMALL + 'px)';
    document.getElementById('axix_y').style.transform = 'translateY(' - originalTransY*RATIO_BIG/RATIO_SMALL + 'px)';
    console.log(document.getElementById('axix_y').style.transform)
  }
}


// -------  Click Event  -------


function selectEase(event) {

  currentTarget = event.target;

  switch(currentTarget.id){
    case 'elastic':
      document.getElementById('input_container').innerHTML = ''
      createInput('time',1000,0)
      createInput('factor',0.5,1)
      break;
    case 'spring':
      document.getElementById('input_container').innerHTML = ''
      createInput('stiffness',1500,0)
      createInput('damping(0~1)',0.5,1)
      createInput('velocity',0,2)
      createInput('time',1500,3)
      break;
    case 'fling':
      document.getElementById('input_container').innerHTML = ''
      createInput('velocity',3000,0)
      createInput('friction',1.0,1)
      createInput('time',2500,2)
      break;
    case 'android':
      document.getElementById('input_container').innerHTML = ''
      createInput('time',1000,0)
      createInput('factor',2.0,1)
      break;
    default:
      document.getElementById('input_container').innerHTML = ''
      createInput('time',1000,0)
      // createInput('factor',2.0,1)
  }

  for (var i = 0; i < presetsEls.length; i++) {
    presetsEls[i].classList.remove('active');
  }

  playEase();

}

function convertCoordinates(coords) {
  var x1 = coords[0] * 100;
  var y1 = 100 - (coords[1] * 100);
  var x2 = coords[2] * 100;
  var y2 = 100 - (coords[3] * 100);
  return 'M0 100C' + x1 + ' ' + y1 + ' ' + x2 + ' ' + y2 + ' 100 0';
}

function getCoordinates(value) {
  return convertCoordinates(value.split(','));
}

function playEase(){

  startFrame = 0;
  
  points = smoothLine = [[0, 0]];
  poly.setAttribute('points',points);
  
  var buttonEl = currentTarget;
  var name = buttonEl.name;
  var value = buttonEl.value;
  buttonEl.classList.add('active');
  animateProgress(name);

  var coordinates = getCoordinates(value);
  if(value != 0){
    pathEl.setAttribute('d', coordinates)
  }
  else{
    pathEl.setAttribute('d','M0 0C0 0 0 0 0 0')
  }

}

for (var i = 0; i < presetsEls.length; i++) {
  presetsEls[i].onclick = selectEase;
}


// -------  Label Switch Function  -------

function createInput(string,val,index){
  
  switch(string)
  {
    case 'time':
      transTime = Number(val);
      break;
    case 'stiffness':
      stiffnessDeafultFactor = Number(val);
      break;
    case 'velocity':
      startDefaultVelocity = Number(val);
      break;
    case 'factor':
      androidDeafultFactor = Number(val);
      break;
    case 'friction':
      androidDeafultFactor = Number(val);
      break;
    case 'damping(0~1)':
      androidDeafultFactor = Number(val);
      break;
    default:
  }

  var inputId = 'input_slot'+index;

  var container = document.getElementById(inputId);

  if(container == null){
    container = document.createElement('div');
    container.id = inputId;
    container.innerHTML = '';
    document.getElementById('input_container').appendChild(container);
  }

  container.innerHTML = ''
  var child = document.createElement('p');
  child.id = string + "_label";
  child.innerHTML = string
  child.className = 'input_label'
  container.appendChild(child);

  var child2 = document.createElement('input');
  child2.id = string + "_input";
  child2.setAttribute("type","number");
  child2.className = 'input_input'
  child2.setAttribute("value",Number(val).toFixed(1));
  child2.setAttribute("step","0.0");
  child2.setAttribute("oninput","onInput(event)");
  container.appendChild(child2);

}

function onInput(event){
  console.log(event.target.id)
  var targetID = event.target.id
  switch(targetID)
  {
    case 'time_input':
      transTime = Number(event.target.value);
      break;
    case 'stiffness_input':
      stiffnessDeafultFactor = Number(event.target.value);
      break;
    case 'velocity_input':
      startDefaultVelocity = Number(event.target.value);
      break;
    case 'factor_input':
      androidDeafultFactor = Number(event.target.value);
      break;
    case 'friction_input':
      androidDeafultFactor = Number(event.target.value);
      break;
    case 'damping(0~1)_input':
      androidDeafultFactor = Number(event.target.value);
      break;
    default:
  }
  playEase();
}
