let video;
let faceMesh;
let faces = [];
let triangles;
let showCoords = false;
let noseIndex = 1;
let center = {"x": 320, "y": 240};
let offset = {"x": 0, "y":0};

let lipsExterior = [
    267,
    269,
    270,
    409,
    291,
    375,
    321,
    405,
    314,
    17,
    84,
    181,
    91,
    146,
    61,
    185,
    40,
    39,
    37,
    0,
  ];
// Define the interior lip landmark indices for drawing the inner lip contour
let lipsInterior = [
    13,
    312,
    311,
    310,
    415,
    308,
    324,
    318,
    402,
    317,
    14,
    87,
    178,
    88,
    95,
    78,
    191,
    80,
    81,
    82,
  ];

let mouthHFeature = 0
let mouthWFeature = 0
//let mouthIndex = [0, 17,];
let mouthIndex = [61, 291,0, 17,];
let rEyeFeature = 0
let rEyeIndex = [362, 263, 386, 374,];
let lEyeFeature = 0
let lEyeIndex = [33, 133, 159, 145,];


function preload() {
  faceMesh = ml5.faceMesh({ maxFaces: 1, refinedLandmarks: false, flipped: true });
}

function mousePressed() {
  console.log(faces);
}

// callback function for ai module containing result
function gotFaces(results) {
  faces = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640,480)
  video.hide();
  faceMesh.detectStart(video, gotFaces);
}

function draw() {
  background(0, 0, 0);

//  image(video, 0, 0, width, height);
  if (faces.length > 0 && faces[0].lips) {
    offset.x = (faces[0].box.xMin + (faces[0].box.width * .5)) - center.x;
    offset.y = (faces[0].box.yMin + (faces[0].box.height * .5)) - center.y;
    drawPartsKeypoints();
    //calculateFeatures();
//    drawBoundingBoxes();
  }
}

function getFeatures(indecies)
{
    // get mouth feature
    let a = faces[0].keypoints[indecies[0]];
    let b = faces[0].keypoints[indecies[1]];
    let ax = a.x - offset.x;
    let ay = a.y - offset.y;
    let bx = b.x - offset.x;
    let by = b.y - offset.y;

    stroke(0, 0, 255);
    line(ax, ay, bx, by);
    strokeWeight(5);
    point(ax, ay);
    point(bx, by);

    featWMouth = dist(a.x, a.y, b.x, b.y);
    noStroke();
    fill(0, 0, 255);
    textSize(24);
    text(round(featWMouth), bx, by);

    a = faces[0].keypoints[indecies[2]];
    b = faces[0].keypoints[indecies[3]];
    ax = a.x - offset.x;
    ay = a.y - offset.y;
    bx = b.x - offset.x;
    by = b.y - offset.y;

    stroke(0, 0, 255);
    line(ax, ay, bx, by);
    strokeWeight(5);
    point(ax, ay);
    point(bx, by);

    featHMouth = dist(a.x, a.y, b.x, b.y);
    noStroke();
    fill(0, 0, 255);
    textSize(24);
    text(round(featWMouth), bx, by);
}

function getREyeFeatures(){

}

function calculateFeatures() {
  getFeatures(mouthIndex);
  getFeatures(rEyeIndex);
  getFeatures(lEyeIndex);
}

function drawBoundingBoxes() {
    fill(255, 255, 255, 100);
    rect(
      faces[0].box.x,
      faces[0].box.y,
      faces[0].box.width,
      faces[0].box.height
    );

    fill(255, 255, 255, 100);
    rect(faces[0].box.xMin, faces[0].box.yMin, faces[0].box.width, faces[0].box.height);
}


// Draw keypoints for specific face element positions
function drawPartsKeypoints() {
    strokeWeight(2);

    // If there is at least one face
    if (faces.length > 0) {

        // draw face oval
        stroke(0, 0, 255);
        beginShape();
        for (let i = 0; i < faces[0].faceOval.keypoints.length; i++) {
            let keypoint = faces[0].faceOval.keypoints[i];
            let x = (keypoint.x - (faces[0].box.xMin + (faces[0].box.width * .5))) + center.x;
            let y = (keypoint.y - (faces[0].box.yMin + (faces[0].box.height * .5))) + center.y;
            vertex(x, y);

            if(showCoords){
                // display the index
                noStroke();
                fill(255, 0, 0);
                textSize(8);
                text(i, x + 10, y);
            }
        }
        stroke(255, 0, 0);
        fill(255, 200, 0);
        endShape(CLOSE);

        // draw lips
        //noFill();
        fill(255,0,0);
        beginShape();
        for (let i = 0; i < lipsExterior.length; i++) {
            let index = lipsExterior[i];
            let keypoint = faces[0].keypoints[index];
            let x = (keypoint.x - (faces[0].box.xMin + (faces[0].box.width * .5))) + center.x;
            let y = (keypoint.y - (faces[0].box.yMin + (faces[0].box.height * .5))) + center.y;
            vertex(x, y);
        }
        endShape(CLOSE);

        fill(255,200,0);
        beginShape();
        for (let i = 0; i < lipsInterior.length; i++) {
            let index = lipsInterior[i];
            let keypoint = faces[0].keypoints[index];
            let x = (keypoint.x - (faces[0].box.xMin + (faces[0].box.width * .5))) + center.x;
            let y = (keypoint.y - (faces[0].box.yMin + (faces[0].box.height * .5))) + center.y;
            vertex(x, y);
        }
        endShape(CLOSE);

        // draw right eye
        fill(255, 0, 0);
        for (let i = 0; i < faces[0].rightEye.keypoints.length; i++) {
            let rightEye = faces[0].rightEye.keypoints[i];
            let x = (rightEye.x - (faces[0].box.xMin + (faces[0].box.width * .5))) + center.x;
            let y = (rightEye.y - (faces[0].box.yMin + (faces[0].box.height * .5))) + center.y;
            circle(x, y, 5);
        }

        // draw right eye brow
        fill(55, 55, 150);
        for (let i = 0; i < faces[0].rightEyebrow.keypoints.length; i++) {
            let rightEyebrow = faces[0].rightEyebrow.keypoints[i];
            let x = (rightEyebrow.x - (faces[0].box.xMin + (faces[0].box.width * .5))) + center.x;
            let y = (rightEyebrow.y - (faces[0].box.yMin + (faces[0].box.height * .5))) + center.y;
            circle(x, y, 5);
        }

        // draw left eye
        fill(255, 0, 0);
        for (let i = 0; i < faces[0].leftEye.keypoints.length; i++) {
            let leftEye = faces[0].leftEye.keypoints[i];
            let x = (leftEye.x - (faces[0].box.xMin + (faces[0].box.width * .5))) + center.x;
            let y = (leftEye.y - (faces[0].box.yMin + (faces[0].box.height * .5))) + center.y;
            circle(x, y, 5);
        }

        // draw right eye
        fill(55, 55, 150);
        for (let i = 0; i < faces[0].leftEyebrow.keypoints.length; i++) {
            let leftEyebrow = faces[0].leftEyebrow.keypoints[i];
            let x = (leftEyebrow.x - (faces[0].box.xMin + (faces[0].box.width * .5))) + center.x;
            let y = (leftEyebrow.y - (faces[0].box.yMin + (faces[0].box.height * .5))) + center.y;
            circle(x, y, 5);
        }

        // draw tip of nose
        let origin = faces[0].keypoints[noseIndex];
        fill(255, 200, 0);
        let x = (origin.x - (faces[0].box.xMin + (faces[0].box.width * .5))) + center.x;
        let y = (origin.y - (faces[0].box.yMin + (faces[0].box.height * .5))) + center.y;
        strokeWeight(5);
        circle(
            x, 
            y, 
            faces[0].box.width * .1
        );
    }
}

  
  